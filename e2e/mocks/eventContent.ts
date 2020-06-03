export const eventContent = {
    "$id": "https://cert.arianee.org/version1/ArianeeEvent-i18n.json",
    "$schema": "https://cert.arianee.org/version1/ArianeeEvent-i18n.json",
    "title": "Arianee Event",
    "description": "Describing an Arianee Event such as servicing, auction, special event ...",
    "type": "object",
    "properties": {
        "$schema": {
            "title": "$schema",
            "type": "string",
            "default": "https://cert.arianee.org/version1/ArianeeEvent-i18n.json",
            "widget": "hidden"
        },
        "eventType": {
            "type": "string",
            "title": "Type",
            "description": "The type of Event.",
            "widget": {
                "id": "select"
            },
            "oneOf": [
                {
                    "title": "Service",
                    "description": "Service - usually issued by customer support.",
                    "enum": [
                        "service"
                    ]
                },
                {
                    "title": "Auction",
                    "description": "Auction - usually issued when a financial transaction and a transfer of certificate are involved.",
                    "enum": [
                        "auction"
                    ]
                }

            ]
        },
        "language": {
            "type": "string",
            "title": "Default Language",
            "widget": {
                "id": "select"
            },
            "oneOf": [
                {"enum": ["fr-FR"], "title": "French", "description": "French"},
                {"enum": ["en-US"], "title": "English (US)", "description": "English (US)"},
                {"enum": ["zh-TW"], "title": "Chinese (traditional)","description": "Chinese (traditional)"},
                {"enum": ["zh-CN"], "title": "Chinese (simplified)","description": "Chinese (simplified)"},
                {"enum": ["ko-KR"], "title":"Korean", "description": "Korean"},
                {"enum": ["ja-JP"], "title":"Japanese", "description": "Japanese"},
                {"enum": ["de-DE"], "title":"German", "description": "German"}
            ]
        },
        "title": {
            "type": "string",
            "title": "Title",
            "description": "Event title. \n Likely to be the first thing displayed on a wallet app.",
            "default": ""
        },
        "description": {
            "type": "string",
            "title": "Description",
            "description": "Description of the Event. \n A description can be stored for each language",
            "widget": {
                "id": "textarea"
            }
        },
        "externalContents": {
            "required": false,
            "type": "array",
            "title": "External Contents",
            "description": "This field is designed to store the links to external contents the Event issuer whish to introduce to the end customer in a wallet app.\n Specific external contents can be stored for each language.",
            "items": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "title": "Type",
                        "widget": {
                            "id": "select"
                        },
                        "oneOf": [
                            {"enum": ["website"], "title":"Website (main)", "description": "Website (main)"},
                            {"enum": ["eshop"], "title":"Eshop", "description": "Eshop"},
                            {"enum": ["other"], "title":"other", "description": "other"}
                        ]
                    },
                    "title": {
                        "type": "string",
                        "title": "Title",
                        "widget": {
                            "id": "string"
                        }
                    },
                    "url": {
                        "type": "string",
                        "title": "Url",
                        "widget": {
                            "id": "string"
                        }
                    },
                    "order": {
                        "type": "number",
                        "title": "Order (number)"
                    }
                }
            }
        },
        "i18n": {
            "type": "array",
            "title": "Other languages : Title / Description / External contents",
            "description": "Events' details in languages different than the default one.",
            "items": {
                "type": "object",
                "properties": {
                    "language": {
                        "type": "string",
                        "title": "Language",
                        "widget": {
                            "id": "select"
                        },
                        "oneOf": [
                            {"enum": ["fr-FR"], "title":"French", "description": "French"},
                            {"enum": ["en-US"], "title":"English (US)", "description": "English (US)"},
                            {"enum": ["zh-TW"], "title":"Chinese (traditional)", "description": "Chinese (traditional)"},
                            {"enum": ["zh-CN"], "title":"Chinese (simplified)", "description": "Chinese (simplified)"},
                            {"enum": ["ko-KR"], "title":"Korean", "description": "Korean"},
                            {"enum": ["ja-JP"], "title":"Japanese", "description": "Japanese"},
                            {"enum": ["de-DE"], "title":"German", "description": "German"}
                        ]
                    },
                    "title": {
                        "type": "string",
                        "title": "Title",
                        "widget": {
                            "id": "textarea"
                        }
                    },
                    "description": {
                        "type": "string",
                        "title": "Description",
                        "description": "Description of the Event. \n A description can be stored for each language",
                        "widget": {
                            "id": "textarea"
                        }
                    },

                    "externalContents": {
                        "required": false,
                        "type": "array",
                        "title": "External Contents",
                        "description": "This field is designed to store the links to external contents the Event issuer whish to introduce to the end customer in a wallet app.\n Specific external contents can be stored for each language.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "title": "Type",
                                    "widget": {
                                        "id": "select"
                                    },
                                    "oneOf": [
                                        {"enum": ["website"], "title":"Website (main)", "description": "Website (main)"},
                                        {"enum": ["eshop"], "title":"Eshop", "description": "Eshop"},
                                        {"enum": ["other"], "title":"other", "description": "other"}
                                    ]
                                },
                                "title": {
                                    "type": "string",
                                    "title": "Title",
                                    "widget": {
                                        "id": "string"
                                    }
                                },
                                "url": {
                                    "type": "string",
                                    "title": "Url",
                                    "widget": {
                                        "id": "string"
                                    }
                                },
                                "order": {
                                    "type": "number",
                                    "title": "Order (number)"
                                }
                            }
                        }
                    }
                }
            }
        },

        "medias": {
            "type": "array",
            "title": "Pictures & Medias",
            "description": "Pictures & Medias used to support the presentation of the Event in the wallet app.",
            "items": {
                "type": "object",
                "properties": {
                    "mediaType": {
                        "type": "string",
                        "title": "Media Type",
                        "widget": {
                            "id": "select"
                        },
                        "oneOf": [
                            {
                                "enum": [
                                    "picture"
                                ],
                                "title": "Picture (png / jpg)",
                                "description": "Picture (png / jpg)"
                            },
                            {
                                "enum": [
                                    "youtube"
                                ],
                                "title": "Youtube video",
                                "description": "Youtube video"
                            }
                        ]
                    },
                    "type": {
                        "type": "string",
                        "title": "Type",
                        "widget": {
                            "id": "select"
                        },
                        "oneOf": [
                            {
                                "enum": [
                                    "product"
                                ],
                                "title": "Event media / picture",
                                "description": "Event media / picture"
                            }
                        ]
                    },
                    "url": {
                        "type": "string",
                        "title": "URL",
                        "widget": {
                            "id": "string"
                        }
                    },
                    "hash": {
                        "type": "string",
                        "title": "Media Hash",
                        "widget": {
                            "id": "string"
                        }
                    },
                    "order": {
                        "type": "number",
                        "title": "Media Order (number)"
                    }
                }
            }
        },
        "attributes": {
            "type": "array",
            "title": "Specific Attributes",
            "description":"Information on the specific attributes of the Event.",
            "items": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "title": "Type",
                        "widget": {
                            "id": "select"
                        },
                        "oneOf": [
                            {
                                "title": "Color",
                                "description": "Color",
                                "enum": [
                                    "color"
                                ]
                            },
                            {
                                "title": "Material",
                                "description": "Material",
                                "enum": [
                                    "material"
                                ]
                            },
                            {
                                "title": "Printed",
                                "description": "Printed",
                                "enum": [
                                    "printed"
                                ]
                            }
                        ]
                    },
                    "value": {
                        "type": "string",
                        "title": "Value",
                        "widget": {
                            "id": "string"
                        }
                    }
                }
            }
        },
        "valuePrice": {
            "type": "string",
            "title": "Price",
            "default": "",
            "description": "Price of the service related to the event, if applicable."
        },
        "currencyPrice": {
            "type": "string",
            "title": "Currency",
            "default": "",
            "description": "Currency",
            "widget": {
                "id": "select"
            },
            "oneOf": [
                {
                    "title": "US Dollar",
                    "description": "US Dollar",
                    "enum": [
                        "USD"
                    ]
                },
                {
                    "title": "Euro",
                    "description": "Euro",
                    "enum": [
                        "EUR"
                    ]
                },
                {
                    "title": "Pound",
                    "description": "Pound",
                    "enum": [
                        "GBP"
                    ]
                }
            ]
        },
        "location": {
            "type": "string",
            "title": "Location",
            "description": "Location related to the event, if applicable.",
            "default": ""
        }
    },
    "required": [
        "$schema"
    ]
}
