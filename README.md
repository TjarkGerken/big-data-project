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

Die Applikation ermöglicht die Analyse der individuellen Nutzerdaten der Musikstreamingplattform Spotify. Hierbei werden die Daten des letzten Jahres des jeweiligen Benutzers angefragt und daraufhin informationsschöpfend aufgearbeitet, um diese anschließend ansehnlich zu präsentieren. 

Der Hintergrund ist hierbei einen tieferen und ausführlicheren Einblick in den eigenen Musikgeschmack und das damit einhergehende Konsumverhalten zu erhalten, um in Zukunft noch bessere Entscheidungen bei der Songauswahl oder auch -suche treffen zu können und ältere Schätze nicht zu vergessen. 

Auch wenn Spotify selbst eine ähnliche Funktion anbietet ist diese insofern nicht ausreichend, dass sie lediglich einmal am Ende jeden Jahres für den Nutzer erstellt wird und diesem so die Möglichkeit nimmt auch unter dem Jahr eine ausführliche Einsicht in diese wertvollen Informationen zu bekommen.

Mit dieser Applikation möchten wir folgende Analysen bereitstellen:
- Lieblingssong (längste aggregierte Spielzeit des Songs über den vorliegenden Zeitraum)
- Lieblingskünstler (längste aggregierte Spielzeit der Songs eine Künstlers über den vorliegenden Zeitraum)
- Gesamte Streamingzeit (addierte Spieltzeit aller Songs über den vorliegenden Zeitraum)

Diese Funktionen werden mit den passenden Titelbildern und Höhrproben der Songs sowie den Profilbildern der Künstler ergänzt, um die echte Spotify-Erfahrung zu bieten und den Wiedererkennungswert zu wahren.

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
