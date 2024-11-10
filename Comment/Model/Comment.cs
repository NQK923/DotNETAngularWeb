using System.ComponentModel.DataAnnotations;

namespace Comment.Model;

public class Comment
{
    [Key]
    public int IdComment { get; init; }
    public int IdChapter { get; init; }
    public int IdAccount { get; init; }
    public string Content { get; set; }
    public bool IsReported { get; set; }
    public DateTime Time { get; set; }
}