function Posts({ user, content, date, image, onDelete }) {
  return (
    <div>
      <p>{content}</p>
      {image && <img src={image} alt="post" style={{ maxWidth: '100%' }} />}
      <small>{user}</small>
      <small>{date}</small>
      {onDelete && <button onClick={onDelete}>Delete</button>}
    </div>
  );
}

export default Posts;
