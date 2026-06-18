import React from "react";
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';

function Posts({ user, content, date, image, onDelete }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        marginBottom: "1rem",
        borderRadius: "8px",
      }}
    >
      <p>
        <strong>User:</strong> {user}
      </p>

      <p>{content}</p>

      {image && (
        <img
          src={image}
          alt="Post"
          style={{
            maxWidth: "300px",
            width: "100%",
            borderRadius: "8px",
            marginTop: "10px",
          }}
        />
      )}

      <p>
        <small>
          {new Date(date).toLocaleString()}
        </small>
      </p>

      {onDelete && (
        <button onClick={onDelete}>
          Delete
        </button>
      )}
    </div>
  );
}

export default Posts;