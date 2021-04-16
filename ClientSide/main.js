$(document).ready(()=>{
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://chathub.furkankaratas.com/chathub")
        .build();
    connection.start();

    $(".disabled").addClass("d-none");

    $("body").on("click",".list-group-item-action",function (){
        $(".list-group-item-action").each((index,item)=>{
            item.classList.remove("active");
        });
        $(this).addClass("active");
    });

    $("#btnGirisYap").click(()=>{
        const nickName = $("#txtNickName").val();
        connection.invoke("GetNickName",nickName).catch(error=>console.log(`Hata : ${error}`));
        $(".disabled").removeClass("d-none");
        $(".disabled.col-md-6").removeClass("col-md-6").addClass("col-md-9")
        $(".show").addClass("d-none");
        $("#showNick").html(`Hoşgeldin, ${nickName}`);
    });

    $("#btnGonder").click(()=>{
        const clientName = $(".list-group-item-action.active").first().html();
        const message = $("#txtMesaj").val();
        connection.invoke("SendMessageAsync",message,clientName);
        const messageSendMe = $(".messageSendMe").clone();
        messageSendMe.removeClass("messageSendMe");
        messageSendMe.removeClass("d-none");
        messageSendMe.find("p").html(message);
        messageSendMe.find("h5").html("Sen");
        $("#messages").append(messageSendMe);

    });

    let _groupName ="";
    $("#btnGroupGonder").click(()=>{
        const message = $("#txtMesaj").val();
       if (_groupName != ""){
           connection.invoke("SendMessageToGroupAsync",_groupName,message)
       }
        const messageSendMe = $(".messageSendMe").clone();
        messageSendMe.removeClass("messageSendMe");
        messageSendMe.removeClass("d-none");
        messageSendMe.find("p").html(message);
        messageSendMe.find("h5").html("Sen");
        $("#messages").append(messageSendMe);

    });

    $("#btnCreateGroup").click(()=>{
       connection.invoke("AddGroup",$("#txtCreateGroup").val())
    });

    $("#btnJoinGroups").click(()=>{
        let groupNames = [];
        $(".rooms option:selected").map((i,e)=>{
            groupNames.push(e.innerHTML);
        });
        connection.invoke("AddClientToGroup",groupNames)
    });

    $(".rooms").change(function(){
       let groupName = $(this).val();
       _groupName = groupName[0];
       connection.invoke("GetClientToGroup",groupName[0]);
    });

    connection.on("groups",groups=>{
        let option = `<option selected value="">Oda Seç...</option>`;
        $(".rooms").html("");
        $.each(groups,(index,item)=>{
           option += `<option value="${item.groupName}">${item.groupName}</option>`
        });
        $(".rooms").append(option);
        $("#listGroup").removeClass("d-none");
    });


    connection.on("clientJoined",nickName=>{
        $("#clientDurumMesajlari").html(`${nickName} giriş yaptı...`);
        $("#clientDurumMesajlari").fadeIn(2000,()=>{
            setTimeout(()=>{
                $("#clientDurumMesajlari").fadeOut(2000);
            },2000)
        });
    });
    connection.on("existNickName",nickName=>{
        $("#clientDurumMesajlari").html(`${nickName} tekrar giriş yaptı...`);
        $("#clientDurumMesajlari").fadeIn(2000,()=>{
            setTimeout(()=>{
                $("#clientDurumMesajlari").fadeOut(2000);
            },2000)
        });
    });

    connection.on("newGroupCreated",groupName=>{
        $("#clientDurumMesajlari").html(`${groupName} oluşturuldu...`);
        $("#clientDurumMesajlari").fadeIn(2000,()=>{
            setTimeout(()=>{
                $("#clientDurumMesajlari").fadeOut(2000);
            },2000)
        });
    });

    connection.on("clientAddGroup",groupName=>{
        $("#clientDurumMesajlari").html(`${groupName} katıldınız...`);
        $("#clientDurumMesajlari").fadeIn(2000,()=>{
            setTimeout(()=>{
                $("#clientDurumMesajlari").fadeOut(2000);
            },2000)
        });
    });

    connection.on("getClientInGroup",groupName=>{
        $("#clientDurumMesajlari").html(`${groupName} 'daki kişiler listelendi...`);
        $("#clientDurumMesajlari").fadeIn(2000,()=>{
            setTimeout(()=>{
                $("#clientDurumMesajlari").fadeOut(2000);
            },2000)
        });
    });

    connection.on("clientNotAddGroup",groupName=>{
        $("#clientDurumMesajlari").removeClass("alert-success");
        $("#clientDurumMesajlari").html(`${groupName} adlı odaya zaten katıldınız.`);
        $("#clientDurumMesajlari").fadeIn(2000,()=>{
            $("#clientDurumMesajlari").addClass("alert-danger");
            setTimeout(()=>{
                $("#clientDurumMesajlari").fadeOut(2000);
                $("#clientDurumMesajlari").removeClass("alert-danger");
            },2000)
        });
        $("#clientDurumMesajlari").addClass("alert-success");

    });

    connection.on("Clients",clients=>{
        let list = $("#clientList");
        list.html("<button type=\"button\" class=\"list-group-item list-group-item-action\">\n" +
            "                        Tümü\n" +
            "                    </button>");
        $.each(clients,(index,item)=>{
            let user = $(".list-group-item-action").first().clone();
            user.html(`${item.nickName}`);
            list.append(user);
        });

    });



    connection.on("receiveMessage",(message,nickName)=>{
        const messageSend = $(".messageSend").clone();
        messageSend.removeClass("messageSend");
        messageSend.removeClass("d-none");
        messageSend.find("p").html(message);
        messageSend.find("h5").html(nickName);
        $("#messages").append(messageSend);

    });










});