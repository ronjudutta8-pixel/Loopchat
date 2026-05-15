# Security Specification - TalkChat

## Data Invariants
1. **User Integrity**: A user profile can only be created or updated by the owner.
2. **Chat Membership**: Users can only see chats they are participants of.
3. **Message Privacy**: Only chat participants can read messages. Only the sender can "Delete for Everyone".
4. **Call Signaling**: Only the intended caller and receiver can access call signaling documents.
5. **ID Validation**: All document IDs must be valid alphanumeric strings.

## The Dirty Dozen (Vulnerability Payloads)

1. **Identity Spoofing (Users)**: Attempting to update another user's profile.
2. **Identity Spoofing (Chats)**: Creating a chat where the current user is NOT a participant.
3. **State Shortcutting (Calls)**: Setting a call status to 'active' without an answer from the receiver.
4. **Shadow Update (Messages)**: Attempting to change the `senderId` of an existing message.
5. **Resource Poisoning**: Using a 1MB string as a `chatId`.
6. **PII Leak**: An unauthenticated user attempting to list all user emails.
7. **Orphaned Write**: Creating a message in a chat that doesn't exist.
8. **Privilege Escalation**: Adding oneself to a chat participants list without being invited.
9. **Timestamp Spoofing**: Setting a `createdAt` value in the past or future manually.
10. **Action Bypass**: Updating a message `text` after it has been "Deleted for Everyone".
11. **Signaling Hijack**: Joining a call where the user is neither caller nor receiver.
12. **Mass Scrape**: Listing all chats in the system without a participant filter.

## Invariant Enforcement Strategy
- Use `isValidId()` for all path variables.
- Use `incoming()` vs `existing()` diffs with `affectedKeys().hasOnly()`.
- Use `request.time` for all timestamp validations.
- Use `get()` on parent resources to verify relational membership.
