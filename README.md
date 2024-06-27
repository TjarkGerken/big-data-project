# Use Case: Popular NASA Shuttle Missions

```json
{ 
	"mission": "sts-10", 
	"timestamp": 1604325221 
}
```

## Prerequisites

A running Strimzi.io Kafka operator and a running Hadoop cluster with YARN (for checkpointing)

```bash
minikube start --addons=ingress --memory 7000 --cpus 2


helm repo add strimzi http://strimzi.io/charts/
helm install my-kafka-operator strimzi/strimzi-kafka-operator
kubectl apply -f https://raw.githubusercontent.com/strimzi/strimzi-kafka-operator/0.41.0/examples/kafka/kafka-ephemeral-single.yaml


 helm install --wait \
        my-hadoop-cluster pfisterer-hadoop/hadoop \
        --set hdfs.dataNode.replicas=3  \
        --set yarn.nodeManager.replicas=3
```


## Deploy

To develop using [Skaffold](https://skaffold.dev/), use `skaffold dev`. 
