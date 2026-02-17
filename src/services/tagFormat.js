export function formatTag(tag) {
  const map = {
    grammar: "Gramática",
    vocabulary: "Vocabulario",
    listening: "Listening",
    present_simple: "Present simple",
    past_simple: "Past simple",
    business: "Business",
    communication: "Communication",
  };

  return map[tag] || tag.replaceAll("_", " ");
}
