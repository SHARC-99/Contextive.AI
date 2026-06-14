namespace Contextive.AI.Services
{
    public interface IOpenAIService
    {
        Task<string> GenerateFormattedContentAsync(string input, string outputType);
    }
}
