function Posts({ user, content, date, onDelete }) {
  return (
    <div>
      <p>{content}</p>
      <small>{user}</small>
      <small>{date}</small>

      {onDelete && <button onClick={onDelete}>Delete</button>}
    </div>
  );
}

export default Posts;