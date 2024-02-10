import { useState, useEffect } from "react";

import { ApiTypes, useApiMutation } from "./useApi";

export type Job = ApiTypes<"Job">;
type Id = string | undefined;

type UseJob = {
  /** 新規JobIdを生成する関数 */
  generateId: () => Promise<Id>;
  /** 最後に生成されたJobId */
  id: Id;
  /** 最後にサーバーから受け取った生のJob進捗情報 */
  raw: Job | undefined;
};

/**
 * Job進捗情報をサーバーから購読するためのHook
 */
export const useJob = (): UseJob => {
  const [job, setJob] = useState<Job>();
  const getJobId = (job?: Job) => job?.id?.value;
  const {
    data: generatedJob,
    trigger: generateJob,
  } = useApiMutation("/jobs", "post");
  const jobId = getJobId(generatedJob);

  useEffect(() => {
    if (!jobId) return;
    console.log(`subscribe: ${jobId}`);
    const eventSource = new EventSource(`/api/v1/jobs/${jobId}/subscribe`);
    eventSource.onopen = () => console.log("connection opened");
    eventSource.onmessage = (event) => {
      const job = JSON.parse(event.data) as Job;
      console.log("progress", job);
      setJob(job);
    };
    eventSource.onerror = (event) => {
      console.log(event);
      eventSource.close();
    };
    return () => {
      eventSource.close();
      setJob(undefined);
    };
  }, [jobId]);

  return {
    generateId: () => generateJob().then(getJobId),
    id: jobId as (string | undefined),
    raw: job,
  };
};
