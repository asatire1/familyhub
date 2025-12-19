import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Check,
  Square,
  CheckSquare,
  ShoppingCart,
  Gift,
  Clipboard,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import AddListModal from '../AddListModal';
import './ListsTab.css';

const listIcons = {
  shopping: { icon: ShoppingCart, color: '#4ade80', emoji: '🛒' },
  groceries: { icon: ShoppingCart, color: '#22d3ee', emoji: '🥬' },
  wishlist: { icon: Gift, color: '#ff6b9d', emoji: '🎁' },
  todo: { icon: Clipboard, color: '#5b9aff', emoji: '📋' },
  custom: { icon: Clipboard, color: '#a78bfa', emoji: '📝' }
};

export default function ListsTab() {
  const { 
    currentUser,
    getVisibleLists,
    addListItem,
    toggleListItem,
    deleteListItem,
    clearCheckedItems,
    deleteList,
    canManageTasks 
  } = useApp();

  const [selectedList, setSelectedList] = useState(null);
  const [showAddList, setShowAddList] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const [listMenu, setListMenu] = useState(null);

  // Get visible lists
  const lists = useMemo(() => getVisibleLists(), [getVisibleLists]);

  // Get selected list data
  const currentList = selectedList ? lists.find(l => l.id === selectedList) : null;

  // Handle add item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim() || !selectedList) return;

    await addListItem(selectedList, { text: newItemText.trim() });
    setNewItemText('');
  };

  // Handle toggle item
  const handleToggleItem = async (itemId) => {
    if (!selectedList) return;
    await toggleListItem(selectedList, itemId);
  };

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    if (!selectedList) return;
    await deleteListItem(selectedList, itemId);
  };

  // Handle clear checked
  const handleClearChecked = async () => {
    if (!selectedList) return;
    await clearCheckedItems(selectedList);
  };

  // Handle delete list
  const handleDeleteList = async (listId) => {
    if (window.confirm('Delete this list and all its items?')) {
      await deleteList(listId);
      setSelectedList(null);
      setListMenu(null);
    }
  };

  // Count checked items
  const getCheckedCount = (list) => {
    return (list.items || []).filter(item => item.checked).length;
  };

  // Sort items - unchecked first
  const sortedItems = currentList?.items?.slice().sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  }) || [];

  const checkedCount = currentList ? getCheckedCount(currentList) : 0;
  const totalCount = currentList?.items?.length || 0;

  return (
    <div className="lists-tab">
      <div className="lists-layout">
        {/* Sidebar - Lists */}
        <div className={`lists-sidebar ${selectedList ? 'hidden-mobile' : ''}`}>
          <div className="lists-sidebar-header">
            <h2>Lists</h2>
            {canManageTasks() && (
              <button 
                className="add-list-btn"
                onClick={() => setShowAddList(true)}
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          <div className="lists-grid">
            {lists.length === 0 ? (
              <div className="no-lists">
                <Clipboard size={48} strokeWidth={1.5} />
                <p>No lists yet</p>
                {canManageTasks() && (
                  <button onClick={() => setShowAddList(true)}>
                    <Plus size={18} />
                    Create your first list
                  </button>
                )}
              </div>
            ) : (
              lists.map((list) => {
                const listType = listIcons[list.type] || listIcons.custom;
                const checked = getCheckedCount(list);
                const total = list.items?.length || 0;

                return (
                  <motion.button
                    key={list.id}
                    className={`list-card ${selectedList === list.id ? 'selected' : ''}`}
                    onClick={() => setSelectedList(list.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ '--list-color': list.color || listType.color }}
                  >
                    <div className="list-card-icon">
                      {list.emoji || listType.emoji}
                    </div>
                    <div className="list-card-info">
                      <span className="list-card-name">{list.name}</span>
                      <span className="list-card-count">
                        {total === 0 ? 'Empty' : `${checked}/${total} done`}
                      </span>
                    </div>
                    {total > 0 && (
                      <div className="list-card-progress">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(checked / total) * 100}%` }}
                        />
                      </div>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Main Area - List Items */}
        <div className={`list-detail ${!selectedList ? 'hidden-mobile' : ''}`}>
          {!selectedList ? (
            <div className="no-list-selected">
              <Clipboard size={64} strokeWidth={1} />
              <p>Select a list to view items</p>
            </div>
          ) : currentList ? (
            <>
              {/* List Header */}
              <div className="list-detail-header">
                <button 
                  className="back-btn mobile-only"
                  onClick={() => setSelectedList(null)}
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="list-detail-info">
                  <div 
                    className="list-detail-icon"
                    style={{ background: currentList.color || listIcons[currentList.type]?.color }}
                  >
                    {currentList.emoji || listIcons[currentList.type]?.emoji || '📝'}
                  </div>
                  <div>
                    <h2>{currentList.name}</h2>
                    <span className="list-detail-count">
                      {checkedCount} of {totalCount} items done
                    </span>
                  </div>
                </div>

                <div className="list-detail-actions">
                  {checkedCount > 0 && (
                    <button 
                      className="clear-checked-btn"
                      onClick={handleClearChecked}
                    >
                      <Sparkles size={16} />
                      Clear done
                    </button>
                  )}
                  
                  {canManageTasks() && (
                    <div className="list-menu-wrapper">
                      <button 
                        className="list-menu-btn"
                        onClick={() => setListMenu(listMenu === currentList.id ? null : currentList.id)}
                      >
                        <MoreVertical size={20} />
                      </button>

                      <AnimatePresence>
                        {listMenu === currentList.id && (
                          <motion.div 
                            className="list-menu"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <button onClick={() => {
                              setEditingList(currentList);
                              setShowAddList(true);
                              setListMenu(null);
                            }}>
                              <Edit2 size={14} />
                              Edit List
                            </button>
                            <button 
                              className="delete"
                              onClick={() => handleDeleteList(currentList.id)}
                            >
                              <Trash2 size={14} />
                              Delete List
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Item Form */}
              <form className="add-item-form" onSubmit={handleAddItem}>
                <div className="add-item-input-wrapper">
                  <Plus size={20} className="add-icon" />
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Add an item..."
                    className="add-item-input"
                  />
                </div>
                {newItemText.trim() && (
                  <button type="submit" className="add-item-btn">
                    Add
                  </button>
                )}
              </form>

              {/* Items List */}
              <div className="list-items">
                <AnimatePresence>
                  {sortedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className={`list-item ${item.checked ? 'checked' : ''}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                    >
                      <button 
                        className="item-checkbox"
                        onClick={() => handleToggleItem(item.id)}
                      >
                        {item.checked ? (
                          <CheckSquare size={22} />
                        ) : (
                          <Square size={22} />
                        )}
                      </button>
                      
                      <span className="item-text">{item.text}</span>
                      
                      <button 
                        className="item-delete"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <X size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {sortedItems.length === 0 && (
                  <div className="empty-list">
                    <p>No items yet</p>
                    <span>Add your first item above</span>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Add/Edit List Modal */}
      <AnimatePresence>
        {showAddList && (
          <AddListModal
            onClose={() => {
              setShowAddList(false);
              setEditingList(null);
            }}
            editList={editingList}
          />
        )}
      </AnimatePresence>

      {/* Click outside to close menu */}
      {listMenu && (
        <div 
          className="menu-backdrop"
          onClick={() => setListMenu(null)}
        />
      )}
    </div>
  );
}
