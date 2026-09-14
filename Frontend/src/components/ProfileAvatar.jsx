import { useMemo } from "react";
import { Style, Avatar } from "@dicebear/core";
import definition from "@dicebear/styles/critters.json" with { type: "json" };

const style = new Style(definition);

function ProfileAvatar({ seed = "Felix", size = 128 }) {
  const avatar = useMemo(() => {
    return new Avatar(style, {
      seed: [seed],
      size: size,
    }).toString();
  }, [seed, size]);

  return (
    <div
      className="profile-avatar"
      dangerouslySetInnerHTML={{ __html: avatar }}
    />
  );
}

export default ProfileAvatar;