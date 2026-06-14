namespace Contextive.AI.Services
{
    public interface IVideoService
    {
        Task<string> ExtractAudioAndTranscribeAsync(string videoPath);
    }
}
