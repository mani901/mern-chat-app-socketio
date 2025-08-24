import { useMemo } from "react";

export const useChatFilter = (allChats, searchTerm) => {
  const groups = useMemo(() => 
    allChats.filter(
      (chat) =>
        chat.name.includes("Team") ||
        chat.name.includes("Group") ||
        chat.name.includes("Squad")
    ), [allChats]
  );

  const people = useMemo(() =>
    allChats.filter(
      (chat) =>
        !chat.name.includes("Team") &&
        !chat.name.includes("Group") &&
        !chat.name.includes("Squad")
    ), [allChats]
  );

  const filterChats = (chats) => {
    return chats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredAll = useMemo(() => filterChats(allChats), [allChats, searchTerm]);
  const filteredGroups = useMemo(() => filterChats(groups), [groups, searchTerm]);
  const filteredPeople = useMemo(() => filterChats(people), [people, searchTerm]);

  return {
    groups,
    people,
    filteredAll,
    filteredGroups,
    filteredPeople
  };
};