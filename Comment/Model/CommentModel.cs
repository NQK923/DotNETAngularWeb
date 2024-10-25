namespace Comment.Model;

public class ModelComment
{
    public int? id_comment { get; set; }
    public int id_chapter { get; set; }
    public int id_user { get; set; }
    public string content { get; set; }
    public bool isReported { get; set; }
    public DateTime time { get; set; }
}