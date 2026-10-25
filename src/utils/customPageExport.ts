// src/utils/customPageExport.ts
export const exportPageToMarkdown = (page: any) => {
    const markdown = `# ${page.title}

${page.subtitle ? `> ${page.subtitle}\n` : ''}

---

**页面信息:**
- 类型: ${page.pageType}
- 创建时间: ${new Date(page.createdAt).toLocaleDateString()}
- 更新时间: ${new Date(page.updatedAt).toLocaleDateString()}
- 访问量: ${page.viewCount}

---

${page.content || ''}

${page.seoKeywords ? `\n**关键词:** ${page.seoKeywords}` : ''}
`;

    const element = document.createElement('a');
    const file = new Blob([markdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${page.slug}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

export const exportPageToJSON = (page: any) => {
    const jsonData = JSON.stringify(page, null, 2);
    const element = document.createElement('a');
    const file = new Blob([jsonData], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${page.slug}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};