using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Contextive.AI.Services
{
    public class OpenAIService : IOpenAIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public OpenAIService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _apiKey = configuration["OpenAI:ApiKey"];
        }

        public async Task<string> GenerateFormattedContentAsync(string input, string outputType)
        {
            var prompt = $"Based on the following content, generate a {outputType} in structured format:\n\n\"{input}\"";
            var isGemini = _apiKey != null && _apiKey.StartsWith("AIza");
            var models = isGemini 
                ? new[] { "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-flash-lite-latest" } 
                : new[] { "gpt-4o-mini" };
            var requestUrl = isGemini 
                ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions" 
                : "https://api.openai.com/v1/chat/completions";

            Exception lastException = null;

            foreach (var model in models)
            {
                try
                {
                    var request = new
                    {
                        model = model,
                        messages = new[]
                        {
                            new { role = "user", content = prompt }
                        },
                        temperature = 0.7,
                        max_tokens = 4000
                    };

                    var requestContent = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

                    var response = await _httpClient.PostAsync(requestUrl, requestContent);
                    if (!response.IsSuccessStatusCode)
                    {
                        var errorBody = await response.Content.ReadAsStringAsync();
                        throw new Exception($"AI API call failed for model {model} with status code {response.StatusCode}. Details: {errorBody}");
                    }
                    var json = await response.Content.ReadAsStringAsync();
                    var root = JsonDocument.Parse(json);
                    return root.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";
                }
                catch (Exception ex)
                {
                    lastException = ex;
                    Console.WriteLine($"Error with model {model}: {ex.Message}. Trying next fallback model...");
                }
            }

            throw new Exception("All fallback AI models failed. Last error: " + lastException?.Message, lastException);
        }
    }
}