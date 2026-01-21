#!/bin/sh
# Wait for Azure Service Bus emulator to be ready

echo "Waiting for Azure Service Bus emulator to be healthy..."

max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if wget --spider -q http://service-bus:5300/health 2>/dev/null; then
    echo "Azure Service Bus emulator is healthy!"
    exit 0
  fi
  
  attempt=$((attempt + 1))
  echo "Attempt $attempt/$max_attempts: Service Bus not ready yet, waiting..."
  sleep 4
done

echo "ERROR: Azure Service Bus emulator failed to become healthy after $max_attempts attempts"
exit 1
