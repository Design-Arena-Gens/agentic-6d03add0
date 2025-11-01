export async function searchNotion(accessToken: string, query = "todo") {
  const res = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({ query, page_size: 10, sort: { direction: "descending", timestamp: "last_edited_time" } }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Notion search error: ${res.status}`);
  const json = await res.json();
  return (json.results || []).map((r: any) => ({
    id: r.id,
    url: r.url,
    title: extractTitle(r),
  }));
}

function extractTitle(page: any): string {
  const props = page.properties || {};
  for (const key of Object.keys(props)) {
    const v = props[key];
    if (v?.type === "title" && Array.isArray(v.title)) {
      const t = v.title.map((x: any) => x?.plain_text).join("").trim();
      if (t) return t;
    }
    if (v?.type === "rich_text" && Array.isArray(v.rich_text)) {
      const t = v.rich_text.map((x: any) => x?.plain_text).join("").trim();
      if (t) return t;
    }
  }
  return page?.object === "page" ? "Untitled" : page?.object ?? "Item";
}

export async function createNotionPage(accessToken: string, title: string) {
  // Creates a page in the user's "Quick Notes" by using the workspace inbox (requires integration to be added by user)
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { type: "workspace", workspace: true },
      properties: {
        title: {
          title: [{ type: "text", text: { content: title } }],
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Create Notion page error: ${res.status}`);
  return await res.json();
}
