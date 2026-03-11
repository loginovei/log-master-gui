import { useState } from 'react';
import { Layout, Menu, Select, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAppContext } from '../context/AppContext';

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

const SIDER_WIDTH = 220;
const SIDER_COLLAPSED_WIDTH = 64;

const menuItems = [
  { key: '/',          icon: <DashboardOutlined />,  label: 'Дашборд' },
  { key: '/logs',      icon: <FileTextOutlined />,   label: 'Логи' },
  { key: '/templates', icon: <AppstoreOutlined />,   label: 'Шаблоны' },
  { key: '/stats',     icon: <BarChartOutlined />,   label: 'Статистика' },
];

export function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { apps, selectedApp, setSelectedApp } = useAppContext();

  const siderWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={SIDER_WIDTH}
        collapsedWidth={SIDER_COLLAPSED_WIDTH}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100 }}
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
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <Space>
            <AppstoreAddOutlined style={{ color: '#1677ff' }} />
            <Text type="secondary">Приложение:</Text>
            <Select
              style={{ width: 240 }}
              placeholder="Все приложения"
              allowClear
              value={selectedApp?.code ?? null}
              onChange={(code) => {
                setSelectedApp(code ? (apps.find(a => a.code === code) ?? null) : null);
              }}
              options={apps.map(a => ({ value: a.code, label: a.name }))}
            />
          </Space>
        </Header>

        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)', background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
