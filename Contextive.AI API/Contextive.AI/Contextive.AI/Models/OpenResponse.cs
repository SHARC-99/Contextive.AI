using System.Text.Json.Serialization;

namespace Contextive.AI.Models
{
    public class OpenResponse
    {
        [JsonPropertyName("text")]

        public string Text { get; set; }

    }
}
