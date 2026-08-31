#!/usr/bin/env python3
"""
Space Academy - AWS EC2 & Route 53 On-Demand Manager
Permite encender y apagar la máquina EC2 bajo demanda, actualizando automáticamente el registro DNS en Route 53.
"""

import sys
import time
import argparse
import boto3

INSTANCE_ID = "i-06d681750a6c978e8"
REGION = "us-east-2"
HOSTED_ZONE_ID = "Z0022446TBEHZBF66I1H"
DOMAIN = "academy.nparrado.net."


def get_clients():
    session = boto3.Session(region_name=REGION)
    ec2 = session.client("ec2")
    r53 = session.client("route53")
    cw = session.client("cloudwatch")
    return ec2, r53, cw


def get_instance_info(ec2):
    res = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
    inst = res["Reservations"][0]["Instances"][0]
    state = inst["State"]["Name"]
    public_ip = inst.get("PublicIpAddress")
    return state, public_ip


def update_dns(r53, public_ip):
    print(f"🔄 Actualizando DNS Route 53 ({DOMAIN}) -> {public_ip}...")
    r53.change_resource_record_sets(
        HostedZoneId=HOSTED_ZONE_ID,
        ChangeBatch={
            "Comment": "Actualización automática de IP dinámica Space Academy",
            "Changes": [
                {
                    "Action": "UPSERT",
                    "ResourceRecordSet": {
                        "Name": DOMAIN,
                        "Type": "A",
                        "TTL": 60,
                        "ResourceRecords": [{"Value": public_ip}],
                    },
                }
            ],
        },
    )
    print("✅ Registro DNS Route 53 actualizado (TTL: 60s).")


def start_academy():
    ec2, r53, _ = get_clients()
    state, ip = get_instance_info(ec2)

    if state == "running":
        print(f"⚡ La máquina ya está encendida en {ip}.")
        update_dns(r53, ip)
        print_ready(ip)
        return

    print(f"🚀 Encendiendo instancia EC2 ({INSTANCE_ID})...")
    ec2.start_instances(InstanceIds=[INSTANCE_ID])

    print("⏳ Esperando que la instancia esté en estado 'running'...", end="", flush=True)
    waiter = ec2.get_waiter("instance_running")
    waiter.wait(InstanceIds=[INSTANCE_ID])
    print(" ¡En ejecución!")

    time.sleep(2)
    _, new_ip = get_instance_info(ec2)
    print(f"📡 Nueva IP Pública asignada: {new_ip}")

    update_dns(r53, new_ip)
    print_ready(new_ip)


def stop_academy():
    ec2, _, _ = get_clients()
    state, _ = get_instance_info(ec2)

    if state == "stopped":
        print("💤 La máquina ya se encuentra detenida (costo de cómputo: $0).")
        return

    print(f"🛑 Apagando instancia EC2 ({INSTANCE_ID})...")
    ec2.stop_instances(InstanceIds=[INSTANCE_ID])

    print("⏳ Esperando que la instancia se detenga por completo...", end="", flush=True)
    waiter = ec2.get_waiter("instance_stopped")
    waiter.wait(InstanceIds=[INSTANCE_ID])
    print(" ¡Detenida!")
    print("✅ Instancia apagada con éxito. El cómputo y la red ya no generan cobros.")


def status_academy():
    ec2, r53, cw = get_clients()
    state, ip = get_instance_info(ec2)

    print("=" * 45)
    print(" 🌌 SPACE ACADEMY - ESTADO DE SERVIDOR AWS")
    print("=" * 45)
    print(f"🔹 Instancia EC2:   {INSTANCE_ID} ({REGION})")
    print(f"🔹 Estado actual:   {state.upper()}")
    print(f"🔹 IP Pública:      {ip if ip else 'Ninguna (Detenida)'}")
    print(f"🔹 Dominio:         http://academy.nparrado.net:3000")

    # Alarm
    alarms = cw.describe_alarms(AlarmNames=["ec2-auto-stop-academy-idle"])
    if alarms.get("MetricAlarms"):
        alm_state = alarms["MetricAlarms"][0]["StateValue"]
        print(f"🔹 Auto-Stop Alarm: Activa ({alm_state})")
    print("=" * 45)


def print_ready(ip):
    print("\n" + "=" * 50)
    print(" 🎉 ¡SPACE ACADEMY ESTÁ LISTA!")
    print("=" * 50)
    print(" 🌐 Navegador:  http://academy.nparrado.net:3000")
    print(f" 📡 IP Directa: http://{ip}:3000")
    print(" 🔑 SSH:        ssh maquina_mates")
    print(" ⏱️ Auto-Stop:   Se apagará sola tras 45 min sin uso")
    print("=" * 50 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Administrador On-Demand de Space Academy en AWS")
    parser.add_argument("action", choices=["start", "stop", "status"], help="Acción a realizar")
    args = parser.parse_args()

    if args.action == "start":
        start_academy()
    elif args.action == "stop":
        stop_academy()
    elif args.action == "status":
        status_academy()


if __name__ == "__main__":
    main()
