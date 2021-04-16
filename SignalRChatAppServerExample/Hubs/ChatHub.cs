using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using SignalRChatAppServerExample.Data;
using SignalRChatAppServerExample.Models;

namespace SignalRChatAppServerExample.Hubs
{
    public class ChatHub : Hub
    {
        public async Task GetNickName(string nickName)
        {
            Client client = new Client
            {
                ConnectionId = Context.ConnectionId,
                NickName = nickName
            };

            var exist = ClientSource.Clients.FirstOrDefault(x => x.NickName == nickName);

            if (exist==null)
            {
                
                ClientSource.Clients.Add(client);
                await Clients.Others.SendAsync("ClientJoined", nickName);
                await Clients.All.SendAsync("Clients", ClientSource.Clients);
                await Clients.All.SendAsync("groups", GroupSource.Groups);
            }
            else
            {
                exist.ConnectionId = Context.ConnectionId;
                await Clients.All.SendAsync("existNickName", nickName);
            }

            
            

            
        }

        public async Task SendMessageAsync(string message, string clientName)
        {
            if (string.IsNullOrEmpty(clientName))
            {
                clientName = "Tümü";
            }
            clientName = clientName.Trim();
            Client senderClient = ClientSource.Clients.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            if (clientName == "Tümü")
            {
                await Clients.Others.SendAsync("receiveMessage", message,senderClient.NickName);
            }
            else
            {
                Client client = ClientSource.Clients.FirstOrDefault(x => x.NickName == clientName);

                await Clients.Client(client.ConnectionId).SendAsync("receiveMessage", message,senderClient.NickName);

            }
        }

        public async Task AddGroup(string groupName)
        {

            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            Group group = new Group
            {
                GroupName = groupName
            };

            group.Clients.Add(ClientSource.Clients.FirstOrDefault(c=>c.ConnectionId==Context.ConnectionId));



            GroupSource.Groups.Add(group);

            await Clients.All.SendAsync("groups", GroupSource.Groups);

            await Clients.Caller.SendAsync("newGroupCreated", groupName);

        }


        public async Task AddClientToGroup(IEnumerable<string> groupNames)
        {

            Client client = ClientSource.Clients.FirstOrDefault(c => c.ConnectionId == Context.ConnectionId);

            foreach (var group in groupNames)
            {
                Group _group = GroupSource.Groups.FirstOrDefault(c => c.GroupName == group);
                var exist = _group.Clients.FirstOrDefault(x => x.ConnectionId == client.ConnectionId);
                if (exist==null)
                {
                    _group.Clients.Add(client);
                    await Clients.Caller.SendAsync("clientAddGroup", group);
                }
                else
                {
                    await Clients.Caller.SendAsync("clientNotAddGroup", group);
                }
                await Groups.AddToGroupAsync(Context.ConnectionId, group);
            }
        }

        public async Task GetClientToGroup(string groupName)
        {
            Group group = GroupSource.Groups.FirstOrDefault(x => x.GroupName == groupName);

            await Clients.Caller.SendAsync("clients", group.Clients);

            await Clients.Caller.SendAsync("getClientInGroup", groupName);

        }

        public async Task SendMessageToGroupAsync(string groupName,string message)
        {
            await Clients.Group(groupName).SendAsync("receiveMessage", message,
                ClientSource.Clients.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId).NickName);
        }
    }
}