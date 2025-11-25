'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  PlusIcon,
  PanelLeftIcon,
  PanelRightIcon,
  XIcon,
  FolderIcon,
} from 'lucide-react';

const DRAWER_WIDTH = 280;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

// Chat type matching backend response (without authorId)
interface Chat {
  id: string;
  title: string;
  privacy: 'private' | 'unlisted' | 'public';
  createdAt: string;
  updatedAt: string;
}

interface ChatLayoutProps {
  children: React.ReactNode;
  selectedChatId?: string | null;
  onChatSelect?: (chatId: string | null) => void;
}

export function ChatLayout({
  children,
  selectedChatId,
  onChatSelect,
}: ChatLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(false);

  // Fetch chats
  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/chats`);
      const result: ApiResponse<Chat[]> = await response.json();
      if (result.ok) {
        setChats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle new chat navigation
  const handleNewChat = useCallback(() => {
    router.push('/chats/new');
    if (!isMdUp) setLeftOpen(false);
  }, [router, isMdUp]);

  // Handle chat selection
  const handleChatClick = useCallback(
    (chatId: string) => {
      router.push(`/chats/${chatId}`);
      onChatSelect?.(chatId);
      if (!isMdUp) setLeftOpen(false);
    },
    [router, onChatSelect, isMdUp]
  );

  // Load chats on mount and when pathname changes
  useEffect(() => {
    fetchChats();
  }, [fetchChats, pathname]);

  // Determine selected chat from pathname
  const currentSelectedChatId =
    selectedChatId !== undefined
      ? selectedChatId
      : pathname?.startsWith('/chats/') && pathname !== '/chats/new'
        ? pathname.split('/chats/')[1]
        : null;

  // Left Sidebar Content
  const leftSidebarContent = (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<PlusIcon size={16} />}
          onClick={handleNewChat}
        >
          New Chat
        </Button>
        {!isMdUp && (
          <IconButton onClick={() => setLeftOpen(false)} size="small">
            <XIcon size={18} />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          // Show shimmer skeletons while loading
          Array.from({ length: 5 }).map((_, index) => (
            <ListItem key={`skeleton-${index}`} disablePadding>
              <Box sx={{ width: '100%', p: 1.5 }}>
                <Skeleton
                  variant="text"
                  width="80%"
                  height={20}
                  sx={{ mb: 0.5 }}
                />
                <Skeleton variant="text" width="50%" height={16} />
              </Box>
            </ListItem>
          ))
        ) : (
          <>
            {chats.map((chat) => (
              <ListItem key={chat.id} disablePadding>
                <ListItemButton
                  selected={chat.id === currentSelectedChatId}
                  onClick={() => handleChatClick(chat.id)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemText
                    primary={chat.title}
                    primaryTypographyProps={{
                      noWrap: true,
                      variant: 'body2',
                    }}
                    secondary={new Date(chat.updatedAt).toLocaleDateString()}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {chats.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No chats yet. Create one to get started!
                </Typography>
              </Box>
            )}
          </>
        )}
      </List>
    </>
  );

  // Right Sidebar Content (empty for now)
  const rightSidebarContent = (
    <>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Files
        </Typography>
        {!isMdUp && (
          <IconButton onClick={() => setRightOpen(false)} size="small">
            <XIcon size={18} />
          </IconButton>
        )}
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'text.secondary',
            textAlign: 'center',
            gap: 1,
          }}
        >
          <FolderIcon size={40} strokeWidth={1.5} />
          <Typography variant="body2" color="text.secondary">
            No files generated yet
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Files created during chat will appear here
          </Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Sidebar - Chats */}
      {isMdUp ? (
        // Permanent drawer on md and up
        <Drawer
          variant="persistent"
          open={leftOpen}
          sx={{
            width: leftOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
              position: 'relative',
            },
          }}
        >
          {leftSidebarContent}
        </Drawer>
      ) : (
        // Temporary drawer on smaller screens
        <Drawer
          variant="temporary"
          open={leftOpen}
          onClose={() => setLeftOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {leftSidebarContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Toolbar for toggling panels */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.5,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <IconButton
            onClick={() => setLeftOpen(!leftOpen)}
            size="small"
            sx={{
              color: leftOpen ? 'primary.main' : 'text.secondary',
            }}
          >
            <PanelLeftIcon size={20} />
          </IconButton>
          <IconButton
            onClick={() => setRightOpen(!rightOpen)}
            size="small"
            sx={{
              color: rightOpen ? 'primary.main' : 'text.secondary',
            }}
          >
            <PanelRightIcon size={20} />
          </IconButton>
        </Box>

        {/* Chat content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Right Sidebar - Files (empty for now) */}
      {isMdUp ? (
        // Permanent drawer on md and up
        <Drawer
          variant="persistent"
          anchor="right"
          open={rightOpen}
          sx={{
            width: rightOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderLeft: 1,
              borderColor: 'divider',
              position: 'relative',
            },
          }}
        >
          {rightSidebarContent}
        </Drawer>
      ) : (
        // Temporary drawer on smaller screens
        <Drawer
          variant="temporary"
          anchor="right"
          open={rightOpen}
          onClose={() => setRightOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {rightSidebarContent}
        </Drawer>
      )}
    </Box>
  );
}
