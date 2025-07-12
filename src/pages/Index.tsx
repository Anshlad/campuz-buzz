
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import HomeFeed from "./HomeFeed";
import Profile from "./Profile";
import StudyGroups from "./StudyGroups";
import Communities from "./Communities";
import { Chat } from "./Chat";
import EventCalendar from "./EventCalendar";
import Announcements from "./Announcements";
import Explore from "./Explore";

const Index = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomeFeed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/study-groups" element={<StudyGroups />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/events" element={<EventCalendar />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </AppLayout>
  );
};

export default Index;
