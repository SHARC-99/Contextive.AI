namespace Contextive.AI.Services
{
    public interface IWhisperService
    {
        Task<string> TranscribeAudioAsync(string filePath);
    }
}
