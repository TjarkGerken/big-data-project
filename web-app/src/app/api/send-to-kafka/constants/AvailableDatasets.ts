import { StreamingHistoryTjark } from "@/app/api/send-to-kafka/constants/StreamingHistoryTjark";
import { StreamingHistoryDavid } from "@/app/api/send-to-kafka/constants/StreamingHistoryDavid";
import { StreamingHistoryNiklasHommie } from "@/app/api/send-to-kafka/constants/StreamingHistoryNiklas";
import { StreamingHistoryCarlos } from "@/app/api/send-to-kafka/constants/StreamingHistoryCarlos";

/**
 * This object contains all the currently available datasets that can be sent to the Kafka topic.
 * The key is the name of the dataset and the value is the dataset itself.
 */
export const AVAILABLE_DATASETS = {
  tjark: StreamingHistoryTjark,
  david: StreamingHistoryDavid,
  carlos: StreamingHistoryCarlos,
  niklas: StreamingHistoryNiklasHommie,
};
