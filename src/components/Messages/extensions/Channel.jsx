import React, { useState, useEffect, useRef } from "react";
import { Link, Route, Switch as Routes, useParams } from "react-router-dom";
import firebase from "firebase/app";
import Message from "./Message";
import ActorElement from "./ActorElement";
import PrivateChat from "./PrivateChat";

import {
  ActorsList,
  Messages,
  MessagesHeader,
  Messengers,
  MessengersHeader,
  SelectedAct,
  Reply,
  ReplyText,
} from "../stylesMessaging";

const Channel = ({ user = null, db = null }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scroller = useRef();

  const { uid, displayName, photoURL } = user;

  useEffect(() => {
    try {
      if (!scroller.current) return;
      const element = scroller.current;
      element.scrollTop = element.scrollHeight;
    } catch (e) {
      console.log(e.message);
    }
  }, []);

  const recent = [
    {
      name: "Global chat",
      photoURL:
        "https://avatars.githubusercontent.com/u/122039071?s=400&u=71ad1243b64ff9fd68445f297c039a60ceaefd4a&v=4",
      lastMessage: "Talk to everyone with the global chat",
      uid: "",
    },
    {
      name: "Ronnie Brito",
      photoURL:
        "https://lh3.googleusercontent.com/a/AEdFTp7nsy4yhLo0hOm2zpDjNedfHB9MMWcKej_ki9Rf=s96-c",
      lastMessage: "It won't work",
      uid: "hyHKDNi5S6O6bJkfJfkPVNt1qRA2",
    },
    {
      name: "c137",
      photoURL: "https://randomuser.me/api/portraits/women/8.jpg",
      lastMessage: "Not dynamic yet",
      uid: "EjFZKh5rxTgAAdqpJXmH0DAiT7s2",
    },
  ];

  useEffect(() => {
    if (db) {
      const unsubscribe = db
        .collection("messages")
        .orderBy("createdAt")
        .limit(100)
        .onSnapshot((querySnapshot) => {
          // Get all documents from collection ~ with IDs
          const data = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          // update state
          setMessages(data);
        });

      // Detach listener
      return unsubscribe;
    }
  }, [db]);

  const handleOnChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (db) {
      db.collection("messages")
        .add({
          text: newMessage,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid,
          displayName,
          photoURL,
        })
        .then(() => {
          setNewMessage(() => {
            return "";
          });
        });
    }
  };

  return (
    <>
      <Messengers>
        <MessengersHeader>
          <h2>Users Messages</h2>
        </MessengersHeader>
        <ActorsList>
          <ul className="actors">
            {recent.map((user, i) => {
              return (
                <ActorElement
                  name={user.name}
                  photoURL={user.photoURL}
                  lastMessage={user.lastMessage}
                  uid={user.uid}
                  key={user.uid + i}
                />
              );
            })}
          </ul>
        </ActorsList>
      </Messengers>

      <Messages>
        <Routes>
          <Route exact path="/messaging">
            <MessagesHeader>
              <h2>Advocates Chat Room</h2>
            </MessagesHeader>
            <SelectedAct ref={scroller}>
              <ul className="messages-node">
                {messages.map((message) => (
                  <li key={message.id}>
                    <Message {...message} />
                  </li>
                ))}
              </ul>
            </SelectedAct>
            <Reply>
              <form onSubmit={handleOnSubmit}>
                <ReplyText
                  type="text"
                  value={newMessage}
                  onChange={handleOnChange}
                  id="myInput"
                  placeholder="Type you message here..."
                  autoComplete="off"
                />
                <button type="submit" disabled={!newMessage}>
                  Send
                </button>
              </form>
            </Reply>
          </Route>
          <Route path="/messaging/:uid">
            <PrivateChat db={db} />
          </Route>
        </Routes>
      </Messages>
    </>
  );
};

export default Channel;
