import { useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { createApplication, deleteApplication } from '../api/applications';
import { useAppContext } from '../context/AppContext';
import { useT } from '../i18n/useT';
import type { Application } from '../types';

const { Title } = Typography;

export function ApplicationsPage() {
  const { apps, refreshApps } = useAppContext();
  const t = useT();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<{ code: string; name: string }>();

  async function handleCreate(values: { code: string; name: string }) {
    setSaving(true);
    try {
      await createApplication(values.code, values.name);
      message.success(t.applications.created);
      setModalOpen(false);
      form.resetFields();
      refreshApps();
    } catch {
      message.error(t.applications.createError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(code: string) {
    try {
      await deleteApplication(code);
      message.success(t.applications.deleted);
      refreshApps();
    } catch {
      message.error(t.applications.deleteError);
    }
  }

  const columns: ColumnsType<Application> = [
    {
      title: t.applications.colCode,
      dataIndex: 'code',
      width: 200,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: t.applications.colName,
      dataIndex: 'name',
    },
    {
      key: 'actions',
      title: '',
      width: 60,
      render: (_, record) => (
        <Popconfirm
          title={t.applications.deleteConfirm}
          okText={t.applications.deleteOk}
          cancelText={t.applications.cancel}
          okType="danger"
          onConfirm={() => handleDelete(record.code)}
        >
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{t.applications.title}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          {t.applications.add}
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={apps}
        rowKey="code"
        size="small"
        locale={{ emptyText: t.applications.noApps }}
        pagination={false}
      />

      <Modal
        title={t.applications.modalCreate}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={t.applications.save}
        cancelText={t.applications.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label={t.applications.codeLabel}
            rules={[{ required: true, message: t.applications.codeRequired }]}
          >
            <Input placeholder="MY_APP" />
          </Form.Item>
          <Form.Item
            name="name"
            label={t.applications.nameLabel}
            rules={[{ required: true, message: t.applications.nameRequired }]}
          >
            <Input placeholder={t.applications.namePlaceholder} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
