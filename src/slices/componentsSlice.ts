import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";
import type { SystemComponent } from "../modules/componentsApi";
import { COMPONENTS_MOCK } from "../modules/mock";
import { DEFAULT_IMAGE, DEFAULT_VIDEO } from "../utils/assets";

export interface FilterState {
  searchName: string;
  selectedGroups: string[];
  selectedPriority: string;
}

export interface ComponentsSliceState {
  items: SystemComponent[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  activeFilters: FilterState;
}

const defaultFilters: FilterState = {
  searchName: "",
  selectedGroups: [],
  selectedPriority: "",
};

const initialState: ComponentsSliceState = {
  items: COMPONENTS_MOCK.results,
  loading: false,
  error: null,
  filters: { ...defaultFilters },
  activeFilters: { ...defaultFilters },
};

/**
 * Thunk получения списка компонентов через сгенерированный API-клиент (axios)
 * с передачей параметров фильтрации в запрос к бэкенду
 * и автоматическим fallback на mock-объекты при ошибке / отсутствии бэкенда.
 */
export const fetchComponentsList = createAsyncThunk(
  "components/fetchComponentsList",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { components: ComponentsSliceState };
    const { filters } = state.components;

    try {
      const response = await api.systemComponents.systemComponentsList({
        search: filters.searchName || undefined,
        grouping: filters.selectedGroups.length ? filters.selectedGroups.join(",") : undefined,
        priority: filters.selectedPriority || undefined,
      });

      const data = response.data as unknown;
      if (Array.isArray(data)) {
        return data as SystemComponent[];
      }
      if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.results)) {
          return obj.results as SystemComponent[];
        }
        if (Array.isArray(obj.data)) {
          return obj.data as SystemComponent[];
        }
      }
      return rejectWithValue("Неизвестный формат ответа от сервера");
    } catch {
      // Fallback на mock-коллекцию при отсутствии доступа к бэкенду
      const filtered = COMPONENTS_MOCK.results.filter((item) => {
        const matchSearch =
          !filters.searchName ||
          item.name.toLowerCase().includes(filters.searchName.toLowerCase()) ||
          item.description.toLowerCase().includes(filters.searchName.toLowerCase());
        const matchGroup =
          !filters.selectedGroups.length || filters.selectedGroups.includes(item.grouping);
        const matchPriority =
          !filters.selectedPriority || String(item.priority) === filters.selectedPriority;
        return matchSearch && matchGroup && matchPriority;
      });

      return filtered;
    }
  }
);


export const createComponentAsync = createAsyncThunk(
  "components/createComponentAsync",
  async (newComponent: Partial<SystemComponent>) => {
    try {
      const response = await api.systemComponents.systemComponentsCreate(newComponent);
      return response.data;
    } catch {
      const fallbackItem: SystemComponent = {
        id: Date.now(),
        name: newComponent.name || "Новый компонент",
        priority: Number(newComponent.priority) || 1,
        grouping: newComponent.grouping || "Бэкенд",
        responseTimeMs: Math.floor(Math.random() * 40) + 10,
        description: newComponent.description || "",
        imageUrl: newComponent.imageUrl || DEFAULT_IMAGE,
        videoUrl: newComponent.videoUrl || DEFAULT_VIDEO,
        likesCount: 0,
      };
      return fallbackItem;
    }
  }
);

export const deleteComponentAsync = createAsyncThunk(
  "components/deleteComponentAsync",
  async (id: number) => {
    try {
      await api.systemComponents.systemComponentsDelete(id);
      return id;
    } catch {
      return id;
    }
  }
);

export const likeComponentAsync = createAsyncThunk(
  "components/likeComponentAsync",
  async (id: number) => {
    try {
      const response = await api.systemComponents.systemComponentsLike(id);
      return { id, likesCount: response.data?.likesCount };
    } catch {
      return { id, likesCount: undefined }; 
    }
  }
);

export const componentsSlice = createSlice({
  name: "components",
  initialState,
  reducers: {
    setSearchName(state, action: PayloadAction<string>) {
      state.filters.searchName = action.payload;
    },
    toggleGroup(state, action: PayloadAction<string>) {
      const group = action.payload;
      if (state.filters.selectedGroups.includes(group)) {
        state.filters.selectedGroups = state.filters.selectedGroups.filter((g) => g !== group);
      } else {
        state.filters.selectedGroups.push(group);
      }
    },
    setSelectedPriority(state, action: PayloadAction<string>) {
      state.filters.selectedPriority = action.payload;
    },
    applyFilters(state) {
      state.activeFilters = { ...state.filters };
    },
    resetFilters(state) {
      state.filters = { ...defaultFilters };
      state.activeFilters = { ...defaultFilters };
    },
  },
  extraReducers: (builder) => {
    // 1. fetchComponentsList
    builder
      .addCase(fetchComponentsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComponentsList.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComponentsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка загрузки компонентов";
      });

    // 2. createComponentAsync
    builder
      .addCase(createComponentAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(createComponentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createComponentAsync.rejected, (state) => {
        state.loading = false;
      });

    // 3. deleteComponentAsync
    builder
      .addCase(deleteComponentAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteComponentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteComponentAsync.rejected, (state) => {
        state.loading = false;
      });

    // 4. likeComponentAsync
    builder
      .addCase(likeComponentAsync.fulfilled, (state, action) => {
        const item = state.items.find((c) => c.id === action.payload.id);
        if (item) {
          item.likesCount =
            typeof action.payload.likesCount === "number"
              ? action.payload.likesCount
              : item.likesCount + 1;
        }
      });
  },
});

export const {
  setSearchName,
  toggleGroup,
  setSelectedPriority,
  applyFilters,
  resetFilters,
} = componentsSlice.actions;

export default componentsSlice.reducer;
