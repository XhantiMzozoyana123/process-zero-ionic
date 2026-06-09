# Cline + VPS Ollama (Llama 3) Setup

Connect Cline to your self-hosted Ollama instance running on your VPS.

## Verified Endpoint

| Setting | Value |
|---|---|
| Base URL | `http://63.141.255.202` |
| API path | `/api/...` (e.g. `/api/tags`, `/api/chat`, `/api/generate`) |
| Model ID | `llama3:latest` |
| Params | 8.0B, Q4_0 quantization |
| Context length | 8192 tokens |
| Reverse proxy | nginx -> `http://127.0.0.1:11434` |

Connectivity, model availability, and live inference were all tested successfully on setup day (`"Ollama is running"` + a working `/api/generate` response).

## Configure Cline (this extension)

1. Open the **Cline** panel in VS Code.
2. Click the **settings gear** (top of the Cline panel).
3. Under **API Provider**, select **Ollama**.
4. Fill in the fields:
   - **Base URL**: `http://63.141.255.202`
     - Note: enter the bare host (Cline appends the `/api/...` paths itself). Do **not** add a trailing `/api`.
   - **Model ID**: `llama3:latest`
5. (Optional) Set **Context Window** to `8192` to match the model.
6. Click **Done / Save**.

That's it — start a new Cline task and it will route requests to your VPS.

## Quick re-test commands (PowerShell)

```powershell
# 1. Is Ollama reachable?
curl.exe -s http://63.141.255.202/

# 2. List installed models
curl.exe -s http://63.141.255.202/api/tags

# 3. Run a one-off generation (uses a temp JSON file to avoid quoting issues)
'{"model":"llama3:latest","prompt":"Say hello","stream":false}' | Out-File -Encoding ascii test.json
curl.exe -s http://63.141.255.202/api/generate --data-binary "@test.json"
Remove-Item test.json
```

## Notes & Recommendations

- **Tool calling / agentic limits**: `llama3:latest` (8B) reports only the `completion` capability — it has no native function-calling. Cline uses its own prompt-based tool format, so it works, but an 8B model can struggle with Cline's complex multi-step agent prompts. If you find responses unreliable, consider pulling a stronger / code-tuned model on the VPS, e.g.:
  ```bash
  ollama pull qwen2.5-coder:7b      # strong coding model
  ollama pull llama3.1:8b           # supports tool calling
  ```
  Then set the new name as the Model ID in Cline.
- **Security**: nginx currently exposes Ollama on plain HTTP (port 80) with no authentication — anyone who knows the IP can use your GPU/CPU. Recommended hardening:
  - Add HTTP Basic Auth or an API key check in nginx, or
  - Restrict by IP (`allow`/`deny` in the nginx `location` block), or
  - Put it behind HTTPS (Let's Encrypt + a domain) and a firewall.
- **Context window**: keep `num_ctx` <= 8192 for this model to avoid truncation errors.
