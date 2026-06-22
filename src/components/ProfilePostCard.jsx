import '../css/ProfilePostCard.css';

/**
 * Compact post card used in the Profile page's "User's Posts" section.
 */
function ProfilePostCard({ title, onViewMore }) {
  return (
    <div className="profile-post-card">
      <span className="profile-post-card__title">{title}</span>
      <button className="profile-post-card__btn" onClick={onViewMore}>
        View more
      </button>
    </div>
  );
}

export default ProfilePostCard;
