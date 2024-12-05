using Microsoft.AspNetCore.SignalR;
using Comment.Model;
namespace Comment.Hubs
{
    public class CommentHub : Hub
    {
        public async Task SendComment(CommentDTO comment)
        {
            if (comment == null || string.IsNullOrWhiteSpace(comment.Content))
            {
                // Trường hợp dữ liệu không hợp lệ
                throw new HubException("Invalid comment data.");
            }

            // Gửi bình luận tới tất cả các client
            await Clients.All.SendAsync("ReceiveComment", comment);
        }

        public async Task UpdateComment(CommentDTO updatedComment)
        {
            await Clients.All.SendAsync("ReceiveUpdatedComment", updatedComment);
        }

        public async Task DeleteComment(int idComment)
        {
            await Clients.All.SendAsync("ReceiveDeletedComment", idComment);
        }
    }
}
