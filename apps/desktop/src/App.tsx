import {useEffect, useState} from "react";
import "./App.css";

type Asset = {
  id: string;
  type: string;
  name: string;
  title: string;
  version: string;
  status: string;
  path: string;
};

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);

  async function refreshAssets() {
    const result = await window.agentdock.assets.list();
    setAssets(result);
  }

  async function createDemoSkill() {
    const timestamp = Date.now();

    await window.agentdock.assets.create({
      type: "skill",
      name: `frontend-review-${timestamp}`,
      title: "前端代码审查",
      description: "用于审查前端项目规范和实现细节",
      content: `# 前端代码审查

## 使用场景

当需要审查 React、Vue、TypeScript 前端代码时使用。

## 检查重点

- 组件结构
- 类型定义
- 可维护性
- 可访问性
`,
    });

    await refreshAssets();
  }

  async function createDemoAgentsMd() {
    const timestamp = Date.now();

    await window.agentdock.assets.create({
      type: "agents-md",
      name: `frontend-agents-${timestamp}`,
      title: "前端项目 AGENTS.md",
      description: "用于前端项目的 Agent 协作规则",
      content: `# AGENTS.md

## 项目规则

请遵循当前项目的目录结构、命名规范和代码风格。

## 开发要求

- 修改前先理解现有实现
- 保持改动范围清晰
- 不引入无关依赖
`,
    });

    await refreshAssets();
  }

  useEffect(() => {
    refreshAssets();
  }, []);

  return (
      <main style={{ padding: 24 }}>
        <h1>AgentDock Prototype</h1>

        <p>本阶段用于验证 Asset 管理、本地 Registry 和同步流程。</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button onClick={createDemoSkill}>New Demo Skill</button>
          <button onClick={createDemoAgentsMd}>New Demo AGENTS.md</button>
          <button onClick={refreshAssets}>Refresh</button>
        </div>

        <h2>Assets</h2>

        {assets.length === 0 ? (
            <p>暂无 Asset。</p>
        ) : (
            <ul>
              {assets.map((asset) => (
                  <li key={asset.id} style={{ marginBottom: 12 }}>
                    <strong>{asset.title}</strong>
                    <div>类型：{asset.type}</div>
                    <div>名称：{asset.name}</div>
                    <div>版本：{asset.version}</div>
                    <div>状态：{asset.status}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{asset.path}</div>
                  </li>
              ))}
            </ul>
        )}
      </main>
  );
}

export default App;