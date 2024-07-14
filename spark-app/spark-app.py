from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StringType, StructType, TimestampType

dbUrl = 'jdbc:mysql://my-app-mariadb-service:3306/spotify'
dbOptions = {"user": "root", "password": "mysecretpw"}
dbSchema = 'spotify'

windowDuration = '1 minute'
slidingDuration = '1 minute'

# Example Part 1
# Create a spark session
spark = SparkSession.builder \
    .appName("Mini Spotify").getOrCreate()

# Set log level
spark.sparkContext.setLogLevel('WARN')

# Set checkpoint directory
checkpoint_dir = "hdfs://my-hadoop-cluster-hadoop-hdfs-nn:9000/tmp/krise10"
spark.sparkContext.setCheckpointDir(checkpoint_dir)

# Example Part 2
# Read messages from Kafka
kafkaMessages = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers",
            "my-cluster-kafka-bootstrap:9092") \
    .option("subscribe", "spotify-track-data") \
    .option("startingOffsets", "earliest") \
    .option("auto.offset.reset", "earliest") \
    .load()
    # .option("failOnDataLoss", "false") \


# Define schema of tracking data
trackingMessageSchema = StructType() \
    .add("endTime", StringType()) \
    .add("artistName", StringType()) \
    .add("trackName", StringType()) \
    .add("UID", StringType()) \
    .add("msPlayed", IntegerType())

trackingMessages = kafkaMessages.select(
    from_json(
        column("value").cast("string"),
        trackingMessageSchema
    ).alias("json")
).select(
    column("json.*"),
    to_timestamp(column("json.endTime"), "yyyy-MM-dd'T'HH:mm:ss").alias("endTimeTimestamp")
).withWatermark("endTimeTimestamp", "1 year")

topSongs = trackingMessages.groupBy(
    col("UID"), col("trackName"), col("artistName")
).agg(
    {"msPlayed": "sum"}
).withColumnRenamed("sum(msPlayed)", "total_msPlayed")

topArtists = trackingMessages.groupBy(
    col("UID"), col("artistName")
).agg(
    {"msPlayed": "sum"}
).withColumnRenamed("sum(msPlayed)", "total_msPlayed")

totalPlaytime = trackingMessages.groupBy(
    col("UID")
).agg(
    {"msPlayed": "sum"}
).withColumnRenamed("sum(msPlayed)", "total_msPlayed")

print("\n\n\n\n\n\n\Write to MariaDB\n\n\n\n")

def write_to_db(batch_df, batch_id, table_name):
    """
    Writes a batch of DataFrame to the specified database table.

    Parameters:
    - batch_df (DataFrame): The DataFrame to write to the database.
    - batch_id (int): The identifier for the current batch.
    - table_name (str): The name of the database table to write to.
    """
    try:
        batch_df.write \
            .format("jdbc") \
            .option("url", dbUrl) \
            .option("dbtable", table_name) \
            .option("user", dbOptions["user"]) \
            .option("password", dbOptions["password"]) \
            .mode("overwrite") \
            .save()
    except Exception as e:
        print(f"Error writing batch {batch_id} to database: {e}")


query = topSongs \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(lambda df, id: write_to_db(df, id, "top_songs")) \
    .start()
#.option("checkpointLocation", checkpoint_dir + "/top_songs") \
query2 = topArtists \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(lambda df, id: write_to_db(df, id, "top_artists")) \
    .start()
#.option("checkpointLocation", checkpoint_dir + "/top_artists") \
query3 = totalPlaytime \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(lambda df, id: write_to_db(df, id, "total_playtime")) \
    .start()
#.option("checkpointLocation", checkpoint_dir + "/total_playtime") \
spark.streams.awaitAnyTermination()
