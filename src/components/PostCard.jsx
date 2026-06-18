import '../css/PostCard.css';
import bookmarkIcon from '../assets/bookmark.png';
import commentIcon from '../assets/comment.png';
import likeIcon from '../assets/like.png';
import flagIcon from '../assets/report-flag.png';

function PostCard({ content, image, date, onDelete }) {
  const formattedDate = new Date(date).toLocaleString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  return (
    <div className="post-card">
      <p className="post-card-content">{content}</p>
      {image && <img src={image} alt="post" className="post-card-image" />}
      <div className="post-card-actions">
        <small className="post-card-date">{formattedDate}</small>
        <div className="post-card-icons">
          {onDelete && <button className="post-card-delete" onClick={onDelete}>Delete</button>}
          <img src={flagIcon} alt="flag" className="post-card-icon" />
          <img src={likeIcon} alt="like" className="post-card-icon" />
          <img src={commentIcon} alt="comment" className="post-card-icon" />
          <img src={bookmarkIcon} alt="bookmark" className="post-card-icon" />
        </div>
      </div>
    </div>
  );
}

export default PostCard;
