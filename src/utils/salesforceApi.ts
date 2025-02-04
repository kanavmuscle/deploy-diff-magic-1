interface SubRequest {
  method: string;
  url: string;
  referenceId: string;
}

const BATCH_SIZE = 25;

export const splitInBatches = <T>(array: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
};

export const fetchMetadataDetails = async (
  org: { url: string; instanceUrl: string },
  records: any[],
  type: string
): Promise<any[]> => {
  const subRequests: SubRequest[] = records.map((record) => ({
    method: "GET",
    url: `/services/data/v57.0/tooling/sobjects/${type}/${record.Id}`,
    referenceId: record.Id,
  }));

  const batches = splitInBatches(subRequests, BATCH_SIZE);
  const compositeEndpoint = `${org.instanceUrl}/services/data/v57.0/composite`;

  const compositePromises = batches.map(async (batch) => {
    const response = await fetch(compositeEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${org.url}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ compositeRequest: batch }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from Salesforce:", errorText);
      throw new Error(`Failed to fetch metadata details: ${response.status} ${response.statusText}`);
    }

    return response.json();
  });

  const results = await Promise.all(compositePromises);
  return results.flatMap((result) => result.compositeResponse.map((r: any) => r.body));
};