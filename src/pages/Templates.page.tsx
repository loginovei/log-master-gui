import { useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useFetch } from '../hooks/useFetch';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api/templates';
import { useAppContext } from '../context/AppContext';
import { useT } from '../i18n/useT';
import type { LogTemplate } from '../types';

const { Title } = Typography;

type FormMessage = { lang: string; text: string };

interface TemplateFormValues {
  logCode: string;
  messages: FormMessage[];
}

function toRecord(messages: FormMessage[]): Record<string, string> {
  return Object.fromEntries(messages.map(m => [m.lang, m.text]));
}

function fromRecord(messages: Record<string, string>): FormMessage[] {
  return Object.entries(messages).map(([lang, text]) => ({ lang, text }));
}

export function TemplatesPage() {
  const { selectedApp, selectedLang } = useAppContext();
  const t = useT();
  const { data, loading, refetch } = useFetch(
    () => getTemplates({ appCode: selectedApp?.code }),
    [selectedApp?.code],
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LogTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<TemplateFormValues>();

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ messages: [{ lang: selectedLang, text: '' }] });
    setModalOpen(true);
  }

  function openEdit(template: LogTemplate) {
    setEditing(template);
    form.setFieldsValue({
      logCode: template.logCode,
      messages: fromRecord(template.messages),
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = { logCode: values.logCode, appCode: selectedApp?.code ?? '', messages: toRecord(values.messages) };
      if (editing) {
        await updateTemplate(editing.logCode, payload);
        message.success(t.templates.saved);
      } else {
        await createTemplate(payload);
        message.success(t.templates.created);
      }
      setModalOpen(false);
      refetch();
    } catch {
      message.error(t.templates.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(logCode: string) {
    try {
      await deleteTemplate(logCode);
      message.success(t.templates.deleted);
      refetch();
    } catch {
      message.error(t.templates.deleteError);
    }
  }

  const columns: ColumnsType<LogTemplate> = [
    {
      title: t.templates.colApp,
      dataIndex: 'appCode',
      width: 200,
      render: (v: string) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      title: t.templates.colLogCode,
      dataIndex: 'logCode',
      width: 160,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: t.templates.colMessage,
      dataIndex: 'messages',
      render: (messages: Record<string, string>) => {
        const text = messages[selectedLang] ?? Object.values(messages)[0] ?? '—';
        const isLangMissing = !messages[selectedLang];
        const fallbackLang = isLangMissing ? Object.keys(messages)[0] : null;
        return (
          <span>
            {isLangMissing && fallbackLang && <Tag color="warning">{fallbackLang}</Tag>}
            {text}
          </span>
        );
      },
    },
    {
      title: t.templates.colLangs,
      dataIndex: 'messages',
      width: 120,
      render: (messages: Record<string, string>) => (
        <Space>
          {Object.keys(messages).map(lang => <Tag key={lang}>{lang}</Tag>)}
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title={t.templates.deleteConfirm}
            description={`${t.templates.colLogCode}: ${record.logCode}`}
            onConfirm={() => handleDelete(record.logCode)}
            okText={t.templates.deleteOk}
            cancelText={t.templates.cancel}
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Title level={3} style={{ marginTop: 0 }}>{t.templates.title}</Title>

      <Card
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t.templates.add}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data?.content ?? []}
          loading={loading}
          rowKey="logCode"
          size="small"
          locale={{ emptyText: t.templates.noTemplates }}
          pagination={{ pageSize: 20, showTotal: (total) => `${t.templates.total}: ${total}` }}
        />
      </Card>

      <Modal
        title={editing ? t.templates.modalEdit : t.templates.modalCreate}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={t.templates.save}
        cancelText={t.templates.cancel}
        confirmLoading={saving}
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="logCode"
            label={t.templates.logCodeLabel}
            rules={[{ required: true, message: t.templates.logCodeRequired }]}
          >
            <Input
              placeholder="AUTH_001"
              disabled={!!editing}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item label={t.templates.messagesLabel}>
            <Form.List name="messages" rules={[{
              validator: async (_, items) => {
                if (!items?.length) throw new Error(t.templates.atLeastOneLang);
              }
            }]}>
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        name={[name, 'lang']}
                        rules={[{ required: true, message: '' }]}
                        style={{ marginBottom: 0, width: 70 }}
                      >
                        <Input placeholder="ru" maxLength={10} />
                      </Form.Item>
                      <Form.Item
                        name={[name, 'text']}
                        rules={[{ required: true, message: '' }]}
                        style={{ marginBottom: 0, flex: 1, minWidth: 380 }}
                      >
                        <Input placeholder="Пользователь {0} вошёл в систему" />
                      </Form.Item>
                      <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => remove(name)}
                        disabled={fields.length === 1}
                      />
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ lang: '', text: '' })}
                    icon={<PlusCircleOutlined />}
                    block
                  >
                    {t.templates.addLang}
                  </Button>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
