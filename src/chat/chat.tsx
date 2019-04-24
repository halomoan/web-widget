import { h, Component } from "preact";
import MessageArea from "./message-area";
import { botman } from "./botman";
import {IMessage, IAttachment, IConfiguration} from "../typings";

export default class Chat extends Component<IChatProps, IChatState> {

    [key: string]: any
    botman: any;
    input: HTMLInputElement;
    textarea: HTMLInputElement;

    constructor(props: IChatProps) {
        super(props);

        this.botman = botman;
        this.botman.setUserId(this.props.userId);
        this.botman.setChatServer(this.props.conf.chatServer);
        // this.state.messages = [];
        this.setState({ messages : []});
        // this.state.replyType = ReplyType.Text;
        this.setState({ replyType : ReplyType.Text});
    }

    componentDidMount() {
        if (!this.state.messages.length && this.props.conf.introMessage) {
            this.writeToMessages({
                text: this.props.conf.introMessage,
                type: "text",
                from: "chatbot"
            });
        }
        // Add event listener for widget API
        window.addEventListener("message", (event: MessageEvent) => {
            try {
                this[event.data.method](...event.data.params);
            } catch (e) {
                //
            }
        });
    }

    sayAsBot(text: string) {
        this.writeToMessages({
            text,
            type: "text",
            from: "chatbot"
        });
    }

    say(text: string, showMessage = true) {
        const message: IMessage = {
            text,
            type: "text",
            from: "visitor"
        };

        // Send a message from the html user to the server
        this.botman.callAPI(message.text, false, null, (msg: IMessage) => {
            msg.from = "chatbot";
            this.writeToMessages(msg);
        });

        if (showMessage) {
            this.writeToMessages(message);
        }
    }

    whisper(text: string) {
        this.say(text, false);
    }

    render({}, state: IChatState) {
        return (
            <div>
                <div id="messageArea">
                    <MessageArea
                        messages={state.messages}
                        conf={this.props.conf}
                        messageHandler={this.writeToMessages}
                    />
                </div>
                <input id="fileupload"
                      style="display: none"
                      type="file"
                      onChange={this.handleFileSelect}
                      accept="image/png, image/jpeg, image/bmp"
                />
                <div class="container">
                <div class="btnArea">
                  <a href="#" id="btnAttachment" >
                  <img src="data:image/png;base64,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" alt="attachment"
                  onClick={this.handleUpload}
                  />
                  </a>
                </div>
                <div class="typeArea">
                {this.state.replyType === ReplyType.Text ? (
                    <input
                        id="userText"
                        class="textarea"
                        type="text"
                        placeholder={this.props.conf.placeholderText}
                        ref={input => {
                            this.input = input as HTMLInputElement;
                        }}
                        onKeyPress={this.handleKeyPress}
                        autocomplete="off"
                        autofocus
                    />
                ) : ''}

                </div>
                </div>
                {this.state.replyType === ReplyType.TextArea ? (
                    <div>

                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                             onClick={this.handleSendClick}
                             style="cursor: pointer; position: absolute; width: 25px; bottom: 19px; right: 16px; z-index: 1000"
                             viewBox="0 0 535.5 535.5">
                            <g>
                                <g id="send">
                                    <polygon points="0,497.25 535.5,267.75 0,38.25 0,216.75 382.5,267.75 0,318.75"/>
                                </g>
                            </g>
                        </svg>

                        <textarea
                            id="userText"
                            class="textarea"
                            placeholder={this.props.conf.placeholderText}
                            ref={input => {
                                this.textarea = input as HTMLInputElement;
                            }}
                            autofocus
                        />
                    </div>
                ) : ''}

                <a class="banner" href={this.props.conf.aboutLink} target="_blank">
                    {this.props.conf.aboutText === "AboutIcon" ? (
                        <svg
                            style="position: absolute; width: 14px; bottom: 6px; right: 6px;"
                            fill="#EEEEEE"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1536 1792"
                        >
                            <path d="M1024 1376v-160q0-14-9-23t-23-9h-96v-512q0-14-9-23t-23-9h-320q-14 0-23 9t-9 23v160q0 14 9 23t23 9h96v320h-96q-14 0-23 9t-9 23v160q0 14 9 23t23 9h448q14 0 23-9t9-23zm-128-896v-160q0-14-9-23t-23-9h-192q-14 0-23 9t-9 23v160q0 14 9 23t23 9h192q14 0 23-9t9-23zm640 416q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z" />
                        </svg>
                    ) : (
                        this.props.conf.aboutText
                    )}
                </a>
            </div>
        );
    }

    handleKeyPress = (e: KeyboardEvent) => {
        if (e.keyCode === 13 && this.input.value.replace(/\s/g, "")) {
            this.say(this.input.value);

            // Reset input value
            this.input.value = "";
        }
    };

    handleSendClick = (e: MouseEvent) => {
        this.say(this.textarea.value);

        // Reset input value
        this.textarea.value = "";
    };

    handleUpload = (e: MouseEvent) => {
      let element: HTMLInputElement = document.getElementById('fileupload') as HTMLInputElement;
      element.value = "";
      element.click();
    };

    handleFileSelect = (e: HTMLInputEvent) => {  

        const reader = new FileReader();
        const file: File = e.target.files[0];

        // reader.addEventListener("load", this.readImage, false);
        reader.onload = (e) =>  {

          const attachment: IAttachment = {
              url : reader.result,
              type : 'image'
          };

          const message: IMessage = {
              text: null,
              type: "text",
              from: "visitor",
              attachment: attachment
          };
          this.writeToMessages(message);
        }


        reader.readAsDataURL(file);


        this.botman.callAPI(null, false, e.target.files[0], (msg: IMessage) => {
            msg.from = "chatbot";
            this.writeToMessages(msg);
        });

     };





    static generateUuid() {
        let uuid = '', ii;
        for (ii = 0; ii < 32; ii += 1) {
            switch (ii) {
                case 8:
                case 20:
                    uuid += '-';
                    uuid += (Math.random() * 16 | 0).toString(16);
                    break;
                case 12:
                    uuid += '-';
                    uuid += '4';
                    break;
                case 16:
                    uuid += '-';
                    uuid += (Math.random() * 4 | 8).toString(16);
                    break;
                default:
                    uuid += (Math.random() * 16 | 0).toString(16);
            }
        }
        return uuid;
    }

	writeToMessages = (msg: IMessage) => {
        if (typeof msg.time === "undefined") {
            msg.time = new Date().toJSON();
        }
        if (typeof msg.visible === "undefined") {
            msg.visible = false;
        }
        if (typeof msg.timeout === "undefined") {
            msg.timeout = 0;
        }
        if (typeof msg.id === "undefined") {
            msg.id = Chat.generateUuid();
        }

	    if (msg.attachment === null) {
	        msg.attachment = {}; // TODO: This renders IAttachment useless
	    }

	    this.state.messages.push(msg);
	    this.setState({
	        messages: this.state.messages
	    });

	    if (msg.additionalParameters && msg.additionalParameters.replyType) {
	        this.setState({
                replyType: msg.additionalParameters.replyType
            });
        }
	};
}

interface IChatProps {
    userId: string,
    conf: IConfiguration
}

enum ReplyType {
    Text = "text",

    TextArea = "textarea"
}

interface IChatState {
    messages: IMessage[],

    replyType: string,
}

interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}
