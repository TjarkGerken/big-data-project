# DHBW Mannheim - Big Data
This repository contains the code for the project of the course Big Data at the DHBW Mannheim. The aim was to analyze the 
music streaming data of individuals.

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

# TODO: Spotify App @Tjark

To run the project locally you need the following tools installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)

Furthermore, you need a running Kubernetes cluster with both a Strimzi.io Kafka operator 
and a Hadoop cluster with YARN for checkpointing before you can deploy the app.

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
newgrp docker
# INFO: maybe you need to reboot the system so changes take effect


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


# Install NodeJS through Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install v18.20.3

cd web-app
npm install 
npm run build

# Install Skaffold
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64 && \
sudo install skaffold /usr/local/bin/

skaffold dev
```


## Use Case Description

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
## System Architecture
### Overview
The system includes a frontend application developed with NextJS and a backend application, also based on NextJS, which 
handles central control and data processing. Users log into the web app with their Spotify accounts to access detailed 
analyses. This authentication is done through the Spotify API, which is also used to provide album covers, song previews,
and artist profile pictures.

Data processing is handled by Apache Spark (PySpark). Spark extracts data from a Kafka topic, transforms it, and loads 
the aggregated results into a MariaDB database. Spark uses watermarking to ensure the processing of late-arriving data 
and stores checkpoints in Hadoop HDFS to maintain data consistency and recoverability.

The data stored in MariaDB is retrieved by the backend application and cached via Memcached to optimize performance. 
The entire data pipeline follows an ETL (Extract, Transform, Load) approach, where data is continuously extracted, 
transformed, and loaded into the database.

The data flow begins with the Kafka component, which acts as the data ingestion layer. Spark processes this data in
real-time and stores it in the database. The results are then retrieved by the backend application and passed to the 
frontend application, where they are presented to the users.

![System Architecture](imgs/Alte-Architekur.svg "Systemarchitektur")
![System Architecture](imgs/system-architecture.svg "Systemarchitektur")

Each of the components is described in more detail within the following sections.

### Components
#### Kafka (Data Ingestion)
Kafka serves as a message queue system, enabling live data streaming. In this architecture, Kafka is used to capture 
song play activities and forward them to Spark for processing.

#### Spark (Batch + Stream Processing)
The Spark application is designed to process and analyse streaming data from a Kafka topic, simulating song play
activities. The processed results are then stored in a MariaDB database. The application follows an ETL 
(Extract, Transform, Load) pipeline:

First, it extracts data from a Kafka topic names `spotify-track-data`. This data includes details about song plays, such
as the user id, artist name, track name and milliseconds played. The data is then transformed by parsing the JSON messages
and adding timestamps to facilitate time-based operations. Late-arriving data is handled through watermarking, ensuring 
the application process out-of-order events effectively.

Next, the data is aggregated to compute key metrics, such as total playtime for each song per user, total playtime for 
each artist per user and the total playtime for each user. The results are then loaded into corresponding tables in a 
MariaDB database. Continuous streaming queries are used to process data live with checkpoints (saved in the hadoop cluster) 
ensuring data consistency and recovery from potential failures.

#### MariaDB (Serving Layer)
MariaDB functions as a relational database where the aggregated results from Spark are stored. It acts as the serving 
layer from which the backend application retrieves the required data.

#### Memcached


#### NextJS Frontend
The frontend application, developed with NextJS, provides the user interface through which users can access the analyses.
It communicates with the backend application to retrieve and display the necessary data.

#### NextJS Backend
The backend application, also developed with NextJS, serves as the central control and data processing layer. It retrieves
the data from MariaDB, caches it via Memcached, and provides it to the frontend application. The backend application also
handles the authentication process with the Spotify API.

#### Spotify API
The Spotify API is used for authentication and retrieval of album covers, song previews, and artist profile pictures.
Users log into the web app with their Spotify accounts to access the analyses. Authentication is carried out via an OAuth 
flow, where users log in with their Spotify accounts and grant the application access to their account data. However, 
the actual data used for the analyses is not retrieved from the Spotify API (more on this in the "Challenges" section).

The Spotify API is used for the following functions:
- Registering the application to obtain the Client ID and Client Secret.
- Sending a request to the Spotify endpoint with parameters such as client_id, response_type, redirect_uri, scope, and state.
- User login with their Spotify account, theoretically granting access to account data.
- Redirecting to the web app.
- Sending the authorization code to Spotify to obtain the access token, which needs to be refreshed every hour.
- Fetching album covers, song previews, and artist profile pictures using the access token.

This detailed description of the system architecture and its individual components provides a comprehensive overview 
of the entire system and the interactions of various technologies.


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
