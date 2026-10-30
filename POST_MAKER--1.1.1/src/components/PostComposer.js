import { useState } from "react";
import PlatformSelector from "./PlatformSelector";
import ValidationMessage from "./ValidationMessage";

function PostComposer() {
  const [post, setPost] = useState("");
  const [selected, setSelected] = useState([]);
  const [file, setFile] = useState(null);
  const [publishMessage, setPublishMessage] = useState("");

  let messages = [];
///use state to store validation messages
  selected.forEach((platform) => {
    if (platform === "Twitter" && post.length > 280) {
      messages.push({
        text: "Twitter allows only 280 characters.",
        color: "red",
      });
    }

    if (platform === "Instagram" && post.includes("http")) {
      messages.push({
        text: "Instagram does not support clickable links.",
        color: "orange",
      });
    }
  });

  function handlePublish() {
    // Check if platform is selected
    if (selected.length === 0) {
      alert("Please select at least one platform.");
      return;
    }

    // Check if post is empty
    if (post.trim() === "") {
      alert("Please write a post.");
      return;
    }

    // Check if there are validation errors
    const hasError = messages.some((msg) => msg.color === "red");

    if (hasError) {
      alert("Please fix the errors before publishing.");
      return;
    }

    // Success message
    setPublishMessage("✅ Post Published Successfully!");

    // Clear form
    setPost("");
    setSelected([]);
    setFile(null);

    // Remove success message after 3 seconds
    setTimeout(() => {
      setPublishMessage("");
    }, 3000);
  }

  return (
    <div className="box">
      <PlatformSelector
        selected={selected}
        setSelected={setSelected}
      />

      <textarea
        rows="6"
        placeholder="Write your post..."
        value={post}
        onChange={(e) => setPost(e.target.value)}
      />

      <p>Characters : {post.length}</p>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {file && (
        <p>
          Selected File : <b>{file.name}</b>
        </p>
      )}

      {messages.map((item, index) => (
        <ValidationMessage
          key={index}
          message={item.text}
          color={item.color}
        />
      ))}

      <button onClick={handlePublish}>
        Publish
      </button>

      {publishMessage && (
        <p
          style={{
            color: "green",
            fontWeight: "bold",
            marginTop: "15px",
          }}
        >
          {publishMessage}
        </p>
      )}
    </div>
  );
}

export default PostComposer;