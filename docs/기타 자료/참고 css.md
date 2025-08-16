{
  "name": "Modern Corporate Messenger UI Design System",
  "description": "A design system based on a desktop messenger application, featuring a clean layout with side navigation, a contact list, and floating action buttons. The style is professional and minimalist, with a primary blue color scheme.",
  "ai_context": "This JSON defines the visual styles for a desktop chat application. Use it to replicate the UI components consistently. The core components are a main icon sidebar, a central list panel for contacts/groups, and a floating action button cluster. Pay close attention to the color palette, typography, spacing, and border-radius to maintain a cohesive look and feel.",
  "palette": {
    "primary": {
      "main": "#1A73E8",
      "light": "#669DF6",
      "dark": "#185ABC",
      "text": "#FFFFFF"
    },
    "secondary": {
      "main": "#F8F9FA",
      "dark": "#E9ECF0"
    },
    "text": {
      "primary": "#202124",
      "secondary": "#5F6368",
      "disabled": "#A0A4A8"
    },
    "background": {
      "default": "#FFFFFF",
      "paper": "#FFFFFF",
      "sidebar": "#1A73E8"
    },
    "status": {
      "online": "#34A853",
      "away": "#FBBC04",
      "offline": "#EA4335"
    },
    "notification": {
      "background": "#FF7043",
      "text": "#FFFFFF"
    },
    "divider": "#DCDDE1"
  },
  "typography": {
    "fontFamily": "Inter, 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
    "headings": {
      "h1": {
        "fontSize": "18px",
        "fontWeight": "600"
      },
      "h2": {
        "fontSize": "16px",
        "fontWeight": "500"
      },
      "h3": {
        "fontSize": "14px",
        "fontWeight": "700"
      }
    },
    "body": {
      "p1": {
        "fontSize": "14px",
        "fontWeight": "500"
      },
      "p2": {
        "fontSize": "13px",
        "fontWeight": "400",
        "color": "palette.text.secondary"
      }
    },
    "caption": {
      "fontSize": "12px",
      "fontWeight": "400",
      "color": "palette.text.secondary"
    }
  },
  "spacing": {
    "baseUnit": "8px",
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "shape": {
    "borderRadius": {
      "sm": "4px",
      "md": "8px",
      "lg": "16px",
      "pill": "9999px",
      "circle": "50%"
    }
  },
  "effects": {
    "boxShadow": {
      "subtle": "0px 2px 4px rgba(0, 0, 0, 0.05)",
      "medium": "0px 4px 12px rgba(0, 0, 0, 0.1)"
    }
  },
  "components": {
    "appShell": {
      "description": "The main application window container.",
      "layout": "multi-column flexible layout",
      "style": {
        "borderRadius": "shape.borderRadius.md",
        "boxShadow": "effects.boxShadow.medium",
        "overflow": "hidden"
      }
    },
    "iconSidebar": {
      "description": "The leftmost vertical navigation bar.",
      "style": {
        "backgroundColor": "palette.background.sidebar",
        "padding": "spacing.md 0",
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center",
        "gap": "spacing.lg"
      },
      "icon": {
        "size": "24px",
        "color": "palette.primary.text",
        "opacity": 0.8
      },
      "activeState": {
        "backgroundColor": "palette.primary.light",
        "opacity": 1.0
      }
    },
    "listPanel": {
      "description": "The central panel displaying user/group lists.",
      "style": {
        "backgroundColor": "palette.background.default",
        "padding": "spacing.md",
        "display": "flex",
        "flexDirection": "column",
        "gap": "spacing.md"
      }
    },
    "searchBar": {
      "description": "Input field for searching contacts.",
      "style": {
        "backgroundColor": "palette.secondary.main",
        "borderRadius": "shape.borderRadius.pill",
        "padding": "spacing.sm spacing.md",
        "border": "1px solid transparent"
      },
      "placeholder": {
        "typography": "typography.body.p2"
      }
    },
    "listItem": {
      "description": "An individual item in a list, such as a contact or a group.",
      "style": {
        "display": "flex",
        "alignItems": "center",
        "padding": "spacing.sm",
        "borderRadius": "shape.borderRadius.sm",
        "gap": "spacing.sm"
      },
      "hoverState": {
        "backgroundColor": "palette.secondary.dark"
      },
      "avatar": {
        "size": "40px",
        "borderRadius": "shape.borderRadius.circle"
      },
      "textContainer": {
        "primaryText": {
          "typography": "typography.body.p1",
          "color": "palette.text.primary"
        },
        "secondaryText": {
          "typography": "typography.caption",
          "color": "palette.text.secondary"
        }
      }
    },
    "floatingActionButtons": {
      "description": "A vertically stacked group of quick action buttons.",
      "container": {
        "backgroundColor": "palette.primary.dark",
        "borderRadius": "shape.borderRadius.lg",
        "padding": "spacing.sm",
        "boxShadow": "effects.boxShadow.medium",
        "display": "flex",
        "flexDirection": "column",
        "gap": "spacing.sm"
      },
      "button": {
        "size": "48px",
        "backgroundColor": "palette.primary.main",
        "borderRadius": "shape.borderRadius.circle",
        "iconColor": "palette.primary.text"
      },
      "notificationBadge": {
        "position": "top-right",
        "backgroundColor": "palette.notification.background",
        "textColor": "palette.notification.text",
        "minWidth": "18px",
        "height": "18px",
        "borderRadius": "shape.borderRadius.pill"
      }
    }
  }
}