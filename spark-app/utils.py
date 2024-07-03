# Read from MongoDB

df = spark.read \
    .format("mongodb") \
    .option("uri", "mongodb://admin:password@mongodb:27017/results?authSource=admin") \
    .option("database", "results") \
    .option("collection", "result") \
    .load()

df = spark.read.format("mongo").option("uri", f"{mongo_uri}/{mongo_db}.{mongo_collection}").load()
print("\n\n\n\n\test\n\n\n\n\n")
print(df.to_string())

top_Artist = kafkaMessages \
    .select(from_json(col("value").cast("string"), messageSchema).alias("value")) \
    .select("value.track.artists.name") \
    .groupBy("name") \
    .count() \
    .orderBy(desc("count"))

top_Artist_query = top_Artist \
     .writeStream \
     .outputMode("complete") \
     .format("console") \
     .start()

top_tracks = kafkaMessages \
     .select(from_json(col("value").cast("string"), messageSchema).alias("value")) \
     .select("value.track.name") \
     .groupBy("name") \
     .count() \
     .orderBy(desc("count"))

top_tracks_query = top_tracks \
     .writeStream \
     .outputMode("complete") \
     .format("console") \
     .start()



query.awaitTermination()
print("test")

df.printSchema()

query = parsedMessages \
     .writeStream \
     .format("mongodb") \
     .option("spark.mongodb.output.uri", f"{mongo_uri}/{mongo_db}.{mongo_collection}") \
     .option("checkpointLocation", "/tmp/checkpoints") \
     .outputMode("append") \
     .start()

query.awaitTermination()



query = kafkaMessages \
    .writeStream \
    .outputMode("append") \
    .format("console") \
    .start()

#query.awaitTermination()


parsedMessages = kafkaMessages.select(from_json(col("value").cast("string"), messageSchema).alias("data")).select("data.*")

parsedMessages = parsedMessages.withColumn("played_at", col("played_at").cast(TimestampType()))


