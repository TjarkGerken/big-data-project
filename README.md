# DHBW Mannheim - Big Data

## Contributor
- Yanick Bedel (8424886)
- Tjark Gerken (8692717)
- Carlo Rinderer (1902925)
- Niklas Seither (4253802)
- David Simon (1893552)


## Tech Stack
- [Kubernetes](https://kubernetes.io/)
- [NextJS](https://nextjs.org/)
- [MariaDB](https://mariadb.org/)
- [Memcached](https://memcached.org/)
- [Apache Spark (PySpark)](https://spark.apache.org/)


## Prerequisites

To run the project locally you need the following tools installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)

Furthermore, you need a running Kubernetes cluster with both a Strimzi.io Kafka operator 
and a Hadoop cluster with YARN for checkpointing.

In the following we provide a step-by-step guide to set up the project locally.

```bash

A running Strimzi.io Kafka operator and a running Hadoop cluster with YARN (for checkpointing)

```bash
# Install Docker
## Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

## Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

## Install Docker
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

## Allow user to use docker as non-root
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker # INFO: maybe you need to reboot the system so changes take effect


# Install Minikube
curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 \
  && chmod +x minikube

sudo cp minikube /usr/local/bin && rm minikube

minikube start --addons=ingress --cpus=4 --memory=8000


# Set up Kubernetes for big data project
## Kafka
helm repo add strimzi http://strimzi.io/charts/
helm install my-kafka-operator strimzi/strimzi-kafka-operator
kubectl apply -f https://raw.githubusercontent.com/strimzi/strimzi-kafka-operator/0.41.0/examples/kafka/kafka-ephemeral-single.yaml

## Hadoop
helm repo add pfisterer-hadoop \
    https://pfisterer.github.io/apache-hadoop-helm/

helm repo update 

helm status my-hadoop-cluster 2>&1 >>/dev/null 2>&1 || \
    helm install --wait --timeout 10m0s \
        my-hadoop-cluster pfisterer-hadoop/hadoop \
        --set hdfs.dataNode.replicas=3  \
        --set yarn.nodeManager.replicas=3


# Install NodeJS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm install v18.20.3

cd web-app
npm install 
npm run build

# Install Skaffold
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64 && \
sudo install skaffold /usr/local/bin/

skaffold dev
```


## Use Case Beschreibung

The application makes it possible to analyse individual user data from the Spotify Music streaming platform. 
The data from the last year of the respective user is requested and then analysed in order to present it in
an appealing way.

The background to this is to gain a deeper and more detailed insight into the user's taste in music and the 
associated consumer behaviour in order to be able to make even better decisions when selecting or searching for 
songs in the future and not to forget older treasures

Even though Spotify itself offers a similar function, it is not sufficient in that it is only created for the user once
at the end of each year.

With this application we would like to provide the following analyses:
- Favourite song (longest aggregated playing time of the song over the period)
- Favourite artist (longest aggregated playing time of the songs of an artist over the period)
- Total streaming time (summed playing time of all songs over the period)

These functions are supplemented with the matching title images and audio samples of the songs as well as the 
profile picture of the artists in order to offer the genuine Spotify experience and maintain the recognition value.


## Implementierung
### Data Ingestion => Kafka
### Batch + Stream Processing
### Serving Layer => Maria DB
### Frontend
---- Get Data Mechanismus => Erst Cache => Dann Kafka => Dann MariaDB in einer Loop Abfragen => Dann in Cache speichern.
## Systemarchitektur
![System Architecture](imgs/system-architecture.svg "Systemarchitektur")
### Architektur
### Technologien
#### Kafka (Data Ingestion)
#### Spark (Batch + Stream Processing)
#### MariaDB (Serving Layer)
#### NextJS Frontend
#### Spotify API

Die Benutzerdaten für die in der Web-App dargestellten Analysen stammen zwar direkt von Spotify, werden aber nicht über die Spotify-API abgefragt (mehr dazu im Kapitel "Herausforderungen"). Die Spotify-API wird daher vor allem für die folgenden beiden Funktionen genutzt. 

Dazu gehört einmal die Authentifizierung, welche mit einem Spotify-Account erfolgen muss, um auf die Analysen zugreifen zu können.
- Applikation registrieren für ClientID und Client Secret
- Request an den Spotify-Endpunkt mit den Parametern client_id, response_type, redirect_uri, scope, state
- Log-In durch User mit echtem Spotify-Konto (in der Theorie dadurch Erlaubnis für Zugriff auf Kontodaten)
- Redirect auf die Webapp
- Authorization Code an Spotify senden um Access Token zu erhalten
- Dieser Token muss dann nach einer Stunde neu angefragt werden

Zum zweiten werden durch die Authentifizierung und den dadurch ermöglichten Zugriff auf allgemeine Spotify-Inhalte Titelbilder sowie Hörproben der Songs und Profilbilder der Künstler von Spotify abgefragt.

- ID der Top-Songs/Künstler
- Mit dieser dann API get-request auf die einzelnen Ressourcen

##### Authentifizierung
##### Datenabfrage 
--- Endpoints listen => Wie ist der Prozess => Wir bekommen Track Title => Wir suchen auf dem Search Endpoint => Wir fragen dann die Daten an.
### Daten Modell

## Lernerfahrungen

- Funktionalität der einzelnen Komponenten ist weitaus einfacher, als die zuverlässig Verbindung derer
## Herausforderungen

Spotify-API:

Zu Beginn haben wir die Idee verfolgt über die Authentifizierung des Spotify-Benutzerkontos mittels Spotify-API die Daten der individuellen Benutzer in Echtzeit abzufragen, um diese anschließend in das System zu streamen, um die Nutzung der Anwendung jeder Person mit einem Spotify-Konto zu ermöglichen und die maximale Aktualität der Daten und damit Analysen zu gewährleisten.

Die Einschränkungen der Spotify-API in Hinblick auf den Umfang der abfragbaren Historie auf die letzten 50 Elemente hat diesen Plan jedoch zu nichte gemacht. Wir haben zunächst versucht durch die Angabe eines Timestamps, durch welchen es möglich ist die Elemente nach diesem Zeitpunkt abzufragen, eine Verkettung an Anfragen mit jeweils einem Umfang von 50 Elementen dynamische definierte Zeiträume abzufragen, jedoch ist diese Funktion ebenfalls streng auf die letzten 50 Elemente beschränkt und bietet so kein wirkliches "Big-Data"-Szenario.

Daher haben wir die durch die Datenschutzgesetze Deutschlands festgelegte Auskunftspflicht für Spotify gegenüber ihren Kunden in Anspruch genommen und uns somit Zugang zu den jeweiligen Nutzerhistorien der Gruppenmitglieder verschafft, welche nun in der Web-App auswählbar sind.

weitere:

- MongoDB (non relational DB)
- Orchestration und zuverlässige Verbindung der einzelnen Komponenten
- DNS-Probleme
- Apple <--> Windows Diskrepanzen
- Unzureichende Ressourcen 



## Deploy

To develop using [Skaffold](https://skaffold.dev/), use `skaffold dev`. 
