# Use Case: Spotify Wrapped

## Prerequisites

A running Strimzi.io Kafka operator and a running Hadoop cluster with YARN (for checkpointing)

```bash
minikube start --addons=ingress --memory 7000 --cpus 2


helm repo add strimzi http://strimzi.io/charts/
helm install my-kafka-operator strimzi/strimzi-kafka-operator
kubectl apply -f https://raw.githubusercontent.com/strimzi/strimzi-kafka-operator/0.41.0/examples/kafka/kafka-ephemeral-single.yaml


helm install --wait --timeout 10 \
        my-hadoop-cluster pfisterer-hadoop/hadoop \
        --set hdfs.dataNode.replicas=3  \
        --set yarn.nodeManager.replicas=3
```

## Use Case Beschreibung
Kurzbeschreibung:

Die Applikation ermöglicht die Analyse benutzerbezogener Nutzungsdaten der Musikstreamingplattform Spotify. Hierbei werden die Daten des letzten Jahres des jeweiligen Benutzers angefragt und wissenserweitert verarbeitet und diesem anschließend präsentiert.

Ziele der Analyse:

Das Ziel der 
## Implementierung
### Data Ingestion => Kafka
### Batch + Stream Processing
### Serving Layer => Maria DB
### Frontend
---- Get Data Mechanismus => Erst Cache => Dann Kafka => Dann MariaDB in einer Loop ABfragen => Dann in Cache speichern.
## Systemarchitektur
Hier hätte ich gerne das Architektur Bild
### Architektur
### Technologien
#### Kafka (Data Ingestion)
#### Spark (Batch + Stream Processing)
#### MariaDB (Serving Layer)
#### NextJS Frontend
#### Spotify API
##### Authentifizierung
##### Datenabfrage 
--- Endpoints listen => Wie ist der Prozess => Wir bekommen Track Title => Wir suchen auf dem Search Endpoint => Wir fragen dann die Daten an.
### Daten Modell

## Lernerfahrungen
## Herausforderungen
### MongoDB
=> Was war die Herausforderung => wir haben es gelöst 

## Systeme zum Laufen bekommen



## Deploy

To develop using [Skaffold](https://skaffold.dev/), use `skaffold dev`. 
