<template>
  <div class="todo-container">
    <el-card class="todo-card">
      <template #header>
        <div class="card-header">
          <span>TODO List</span>
          <el-button type="primary" @click="handleAdd">新增任务</el-button>
        </div>
      </template>

      <el-table :data="todoList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="completed" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.completed ? 'success' : 'info'" disable-transitions>
              {{ row.completed ? '已完成' : '待办' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑任务' : '新增任务'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入任务标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入任务描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="状态" prop="completed">
          <el-switch v-model="form.completed" active-text="已完成" inactive-text="待办" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTodoList, createTodo, updateTodo, deleteTodo } from '../api/todos'

const todoList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const defaultForm = {
  title: '',
  description: '',
  completed: false
}

const form = reactive({ ...defaultForm })

const rules = {
  title: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// 加载列表
async function fetchList() {
  try {
    todoList.value = await getTodoList()
  } catch (e) {
    ElMessage.error('加载列表失败: ' + e.message)
  }
}

// 重置表单
function resetForm() {
  Object.assign(form, defaultForm)
  editingId.value = null
  formRef.value?.clearValidate()
}

// 打开新增
function handleAdd() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 打开编辑
function handleEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  form.title = row.title
  form.description = row.description || ''
  form.completed = row.completed
  dialogVisible.value = true
}

// 提交
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateTodo(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createTodo(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error((isEdit.value ? '更新' : '新增') + '失败: ' + e.message)
  } finally {
    submitLoading.value = false
  }
}

// 删除
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除任务「${row.title}」？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteTodo(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败: ' + e.message)
    }
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.todo-container {
  padding: 20px;
}
.todo-card {
  max-width: 1200px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
