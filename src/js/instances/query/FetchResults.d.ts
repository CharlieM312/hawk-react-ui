type Result = {
  formattedResult: string,
  raw: string
}

export default async function FetchResults(hawkClient: HawkClient, queryId: string): Promise<Result>;
