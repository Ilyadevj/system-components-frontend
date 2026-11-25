import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";
import type { SystemComponent } from "../modules/componentsApi";
import { COMPONENTS_MOCK } from "../modules/mock";
import { isMockMode } from "../modules/dataMode";

interface FilterState {
  selectedGroups: string[];
}

export interface ComponentsSliceState {
  items: SystemComponent[];
  mockItems: SystemComponent[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  filters: FilterState;
  activeFilters: FilterState;
}

const initialState: ComponentsSliceState = {
  items: [],
  mockItems: isMockMode ? COMPONENTS_MOCK.results : [],
  loading: false,
  loaded: false,
  error: null,
  filters: { selectedGroups: [] },
  activeFilters: { selectedGroups: [] },
};

function normalizeMediaUrl(value: unknown): string {
  const url = typeof value === "string" ? value.trim() : "";
  return url
    .replace(/^http:\/\/(?:localhost|127\.0\.0\.1):9000(?=\/)/, "")
    .replace(/^\/static\/img\/defaultIcon\.png$/, "/static/img/defaulticon.png");
}

export function normalizeComponent(raw: unknown): SystemComponent {
  const obj = raw as Record<string, unknown>;
  return {
    id: Number(obj.id ?? 0),
    name: String(obj.name ?? ""),
    priority: Number(obj.priority ?? 0),
    grouping: String(obj.grouping ?? "").replace(/^БД$/, "Базы данных"),
    responseTimeMs: Number(obj.responseTimeMs ?? obj.response_time_ms ?? 0),
    description: String(obj.description ?? ""),
    imageUrl: normalizeMediaUrl(obj.imageUrl ?? obj.image_url),
    videoUrl: normalizeMediaUrl(obj.videoUrl ?? obj.video_url),
    likesCount: Number(obj.likesCount ?? obj.likes_count ?? 0),
    isCreator: Boolean(obj.isCreator ?? obj.is_creator),
    isLiked: Boolean(obj.isLiked ?? obj.is_liked),
  };
}

const selectComponents = (state: unknown) =>
  (state as { components: ComponentsSliceState }).components;

export const fetchComponentsList = createAsyncThunk(
  "components/fetchComponentsList",
  async (_, { getState, signal }) => {
    const { activeFilters, mockItems } = selectComponents(getState());
    const groups = activeFilters.selectedGroups;
    if (isMockMode) {
      return mockItems.filter((item) => !groups.length || groups.includes(item.grouping));
    }

    const { data } = await api.systemComponents.systemComponentsList({ groups }, { signal });
    const items = Array.isArray(data) ? data : data?.results;
    if (!Array.isArray(items)) throw new Error("Неизвестный формат ответа от сервера");
    return items.map(normalizeComponent);
  },
  { condition: (_, { getState }) => !selectComponents(getState()).loading }
);

export const deleteComponentAsync = createAsyncThunk(
  "components/deleteComponentAsync",
  async (id: number) => {
    if (!isMockMode) await api.systemComponents.systemComponentsDelete(id);
    return id;
  }
);

export const likeComponentAsync = createAsyncThunk(
  "components/likeComponentAsync",
  async (item: SystemComponent) => {
    const like = item.isLiked ? 0 : 1;
    if (isMockMode) {
      return { ...item, likesCount: item.likesCount + (like ? 1 : -1), isLiked: Boolean(like) };
    }
    const { data } = await api.systemComponents.systemComponentsLike(item.id, like);
    return { ...item, likesCount: data.likes_count, isLiked: Boolean(data.is_liked) };
  }
);

export const componentsSlice = createSlice({
  name: "components",
  initialState,
  reducers: {
    toggleGroup(state, action: PayloadAction<string>) {
      const group = action.payload;
      if (state.filters.selectedGroups.includes(group)) {
        state.filters.selectedGroups = state.filters.selectedGroups.filter((g) => g !== group);
      } else {
        state.filters.selectedGroups.push(group);
      }
    },
    applyFilters(state) {
      state.activeFilters = { ...state.filters };
    },
    resetFilters(state) {
      state.filters = { selectedGroups: [] };
      state.activeFilters = { selectedGroups: [] };
    },
    publishMockComponent(state, action: PayloadAction<SystemComponent>) {
      state.mockItems.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComponentsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComponentsList.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.items = action.payload;
      })
      .addCase(fetchComponentsList.rejected, (state) => {
        state.loading = false;
        state.loaded = true;
        state.error = "Не удалось загрузить каталог компонентов";
      })
      .addCase(deleteComponentAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.mockItems = state.mockItems.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteComponentAsync.rejected, (state) => {
        state.error = "Не удалось удалить компонент";
      })
      .addCase(likeComponentAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        state.items = state.items.map((item) => item.id === updated.id ? updated : item);
        state.mockItems = state.mockItems.map((item) => item.id === updated.id ? updated : item);
      })
      .addCase(likeComponentAsync.rejected, (state) => {
        state.error = "Не удалось изменить лайк";
      });
  },
});

export const { toggleGroup, applyFilters, resetFilters, publishMockComponent } =
  componentsSlice.actions;

export default componentsSlice.reducer;
