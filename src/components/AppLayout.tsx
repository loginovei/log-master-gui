import { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router';

const { Sider, Content } = Layout;
const { Title } = Typography;

const SIDER_WIDTH = 220;
const SIDER_COLLAPSED_WIDTH = 64;

const menuItems = [
  { key: '/',          icon: <DashboardOutlined />, label: 'Дашборд' },
  { key: '/logs',      icon: <FileTextOutlined />,  label: 'Логи' },
  { key: '/templates', icon: <AppstoreOutlined />,  label: 'Шаблоны' },
];

export function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const siderWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={SIDER_WIDTH}
        collapsedWidth={SIDER_COLLAPSED_WIDTH}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ position: 'fixed', height: '100vh', left: 0, top: 0 }}
      >
        {!collapsed && (
          <div style={{ padding: '20px 16px 12px' }}>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>Log Master</Title>
          </div>
        )}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={collapsed ? { marginTop: 16 } : undefined}
        />
      </Sider>
      <Layout style={{ marginLeft: siderWidth, transition: 'margin-left 0.2s' }}>
        <Content style={{ padding: 24, minHeight: '100vh', background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
