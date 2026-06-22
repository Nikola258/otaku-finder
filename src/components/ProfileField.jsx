import '../css/ProfileField.css';

/**
 * A single labeled row in the profile form.
 * children: the input/select/value element to render on the right side.
 */
function ProfileField({ label, children, noHighlight = false, fullWidth = false }) {
  return (
    <div className="profile-field">
      <span className="profile-field__label">{label}</span>
      <div className={`profile-field__value${noHighlight ? ' profile-field__value--plain' : ''}${fullWidth ? ' profile-field__value--full' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export default ProfileField;
