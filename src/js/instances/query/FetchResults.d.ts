type Result = {
  isGraph: boolean,
  result: QueryReport,
  formattedResult: string,
  raw: string,
  modelElement: QueryResult | null,
  queryTime: string
}

export default async function FetchResults(hawkClient: HawkClient, queryId: string): Promise<Result>;
