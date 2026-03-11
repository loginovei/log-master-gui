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
  const { selectedApp } = useAppContext();
  const { data, loading, refetch } = useFetch(() => getTemplates({ appCode: selectedApp?.code }));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LogTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<TemplateFormValues>();

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ messages: [{ lang: 'ru', text: '' }] });
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
        message.success('Шаблон обновлён');
      } else {
        await createTemplate(payload);
        message.success('Шаблон создан');
      }
      setModalOpen(false);
      refetch();
    } catch {
      message.error('Не удалось сохранить шаблон');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(logCode: string) {
    try {
      await deleteTemplate(logCode);
      message.success('Шаблон удалён');
      refetch();
    } catch {
      message.error('Не удалось удалить шаблон');
    }
  }

  const columns: ColumnsType<LogTemplate> = [
    {
      title: 'Код лога',
      dataIndex: 'logCode',
      width: 200,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Шаблоны сообщений',
      dataIndex: 'messages',
      render: (messages: Record<string, string>) => (
        <Space wrap>
          {Object.entries(messages).map(([lang, text]) => (
            <span key={lang}>
              <Tag>{lang}</Tag>{text}
            </span>
          ))}
        </Space>
      ),
    },
    {
      title: 'Языки',
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
            title="Удалить шаблон?"
            description={`Код: ${record.logCode}`}
            onConfirm={() => handleDelete(record.logCode)}
            okText="Удалить"
            cancelText="Отмена"
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
      <Title level={3} style={{ marginTop: 0 }}>Шаблоны логов</Title>

      <Card
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Добавить шаблон
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data?.content ?? []}
          loading={loading}
          rowKey="logCode"
          size="small"
          locale={{ emptyText: 'Шаблоны не найдены' }}
          pagination={{ pageSize: 20, showTotal: (t) => `Всего: ${t}` }}
        />
      </Card>

      <Modal
        title={editing ? 'Редактировать шаблон' : 'Новый шаблон'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={saving}
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="logCode"
            label="Код лога (logCode)"
            rules={[{ required: true, message: 'Введите код лога' }]}
          >
            <Input
              placeholder="AUTH_001"
              disabled={!!editing}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item label="Тексты шаблона по языкам">
            <Form.List name="messages" rules={[{
              validator: async (_, items) => {
                if (!items?.length) throw new Error('Добавьте хотя бы один язык');
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
                    Добавить язык
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
